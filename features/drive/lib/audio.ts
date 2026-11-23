// Tiny Web Audio chiptune engine: an original 8-bar loop ("Golden Hour")
// plus a few sound effects. No audio files — every note is an oscillator.

const BPM = 112;
const STEP = 60 / BPM / 4; // one 16th note, in seconds

const SEMI: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
const midi = (n: string) =>
  12 * (Number(n.at(-1)) + 1) + SEMI[n[0]] + (n[1] === "#" ? 1 : 0);
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

// 8 bars × 16 sixteenths. "." = rest. Chords: Am F C G | Am F C G.
const LEAD = `
  A4 . C5 . E5 . A5 . G5 . E5 . C5 . E5 .
  F5 . . . E5 . C5 . A4 . . . C5 . . .
  G5 . E5 . C5 . E5 . G5 . A5 . G5 . E5 .
  D5 . . . B4 . D5 . G5 . . . . . . .
  A5 . G5 . E5 . C5 . D5 . E5 . . . A4 .
  C5 . F5 . A5 . F5 . E5 . F5 . A5 . C6 .
  G5 . . . E5 . G5 . C6 . B5 . G5 . E5 .
  D5 . G5 . B5 . . . A5 . G5 . D5 . . .
`
  .trim()
  .split(/\s+/);

const CHORDS = [
  ["A2", [0, 3, 7]],
  ["F2", [0, 4, 7]],
  ["C3", [0, 4, 7]],
  ["G2", [0, 4, 7]],
] as const;

let ac: AudioContext | null = null;
let music: GainNode;
let fx: GainNode;
let noiseBuf: AudioBuffer;
let timer = 0;
let step = 0;
let next = 0;

function ctx() {
  if (!ac) {
    ac = new AudioContext();
    const master = ac.createGain();
    master.gain.value = 0.5;
    master.connect(ac.destination);
    music = ac.createGain();
    music.connect(master);
    fx = ac.createGain();
    fx.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  void ac.resume();
  return ac;
}

function tone(
  type: OscillatorType,
  freq: number,
  t: number,
  dur: number,
  vol: number,
  dest: AudioNode,
  slideTo?: number,
) {
  const o = ac!.createOscillator();
  const g = ac!.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(
  t: number,
  dur: number,
  vol: number,
  highpass: number,
  dest: AudioNode,
) {
  const s = ac!.createBufferSource();
  const f = ac!.createBiquadFilter();
  const g = ac!.createGain();
  s.buffer = noiseBuf;
  f.type = "highpass";
  f.frequency.value = highpass;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(dest);
  s.start(t);
  s.stop(t + dur);
}

function schedule() {
  const now = ac!.currentTime;
  if (next < now - 0.2) next = now; // tab was throttled: skip ahead, don't burst
  while (next < now + 0.12) {
    const s = step % LEAD.length;
    const i = s % 16;
    const [root, triad] = CHORDS[Math.floor(s / 16) % 4];
    const r = midi(root);
    if (LEAD[s] !== ".")
      tone("square", hz(midi(LEAD[s])), next, STEP * 1.8, 0.05, music);
    if (i % 2 === 0)
      tone(
        "triangle",
        hz(r + (i % 8 === 4 ? 12 : 0)),
        next,
        STEP * 1.7,
        0.2,
        music,
      );
    if (i === 0)
      for (const n of triad)
        tone("triangle", hz(r + 24 + n), next, STEP * 15, 0.025, music); // pad
    tone("square", hz(r + 36 + triad[i % 3]), next, STEP * 0.6, 0.012, music); // shimmer arp
    if (i % 8 === 0) tone("sine", 150, next, 0.2, 0.5, music, 40); // kick
    if (i % 8 === 4) noise(next, 0.12, 0.15, 1500, music); // snare
    if (i % 4 === 2) noise(next, 0.03, 0.05, 7000, music); // hat
    next += STEP;
    step++;
  }
}

export function setMusic(on: boolean) {
  const a = ctx();
  if (on && !timer) {
    next = a.currentTime + 0.05;
    timer = window.setInterval(schedule, 25);
  } else if (!on && timer) {
    clearInterval(timer);
    timer = 0;
  }
}

export function sfx(kind: "unlock" | "bump" | "arrive") {
  const a = ctx();
  const t = a.currentTime;
  if (kind === "unlock")
    for (const [k, n] of ["C6", "E6", "G6", "C7"].entries())
      tone("square", hz(midi(n)), t + k * 0.07, 0.16, 0.06, fx);
  if (kind === "arrive")
    for (const [k, n] of ["G5", "C6"].entries())
      tone("triangle", hz(midi(n)), t + k * 0.09, 0.25, 0.12, fx);
  if (kind === "bump") {
    noise(t, 0.15, 0.3, 200, fx);
    tone("square", 90, t, 0.12, 0.08, fx, 40);
  }
}
