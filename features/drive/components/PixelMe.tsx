import { ME_PALETTE } from "../lib/render";

// Hand-drawn 24×32 pixel portrait. One char = one pixel; "." is transparent.
// Runs are merged into one <path> per colour once, at module load.

const PAL = ME_PALETTE;

const ME = [
  "........................",
  ".........KK..KK.........",
  "........KHHKKhHKK.......",
  ".......KHHhhHHHHK.......",
  "......KHHhHHHHhHHK......",
  "......KHHHHHHHHHHK......",
  "......KHHHSSSSHHHK......",
  "......KHSHHSSHHSHK......",
  "......KHSSSSSSSSHK......",
  ".....KsSSESSSSESSsK.....",
  ".....KsSSESSsSESSsK.....",
  "......KSSSSSsSSSSK......",
  "......KBSSSMMSSSBK......",
  ".......KBBSSSSBBK.......",
  "........KKBBBBKK........",
  ".......KjJjJjJjJK.......",
  ".....KKJjJjJjJjJjKK.....",
  "...KKJJJJJJJJJJJJJJKK...",
  "..KJJJjJJJJJJJJJJjJJJK..",
  "..KJJjJJJJJJJJJJJJjJJK..",
  "..KJjkJJJJJJJJJJJJkjJK..",
  "..KJjkJJJJJJJJJJJJkjJK..",
  "..KJjkJJJJJJJJJJJJkjJK..",
  "..KJjkJJJJJJJJJJJJkjJK..",
  "..KJjkkkkkkkkkkkkkkjJK..",
  "..KSsKDDDDDDdDDDDDKsSK..",
  "...KSKlDDDDDdDDDDlKSK...",
  "....KKDDDDDDdDDDDDKK....",
  ".....KDDDDDDdDDDDDK.....",
  ".....KDlDDDDdDDDDlK.....",
  ".....KDDDDDdKdDDDDK.....",
  ".....KDDDDDKKKDDDDK.....",
];

// One <path> per colour: each horizontal run becomes a 1px-tall subpath.
const runs: Record<string, string> = {};
for (const [y, row] of ME.entries())
  for (let x = 0; x < row.length; ) {
    let w = 1;
    while (row[x + w] === row[x]) w++;
    if (row[x] !== ".")
      runs[row[x]] = `${runs[row[x]] ?? ""}M${x} ${y}h${w}v1h-${w}z`;
    x += w;
  }
const BODY = Object.entries(runs).map(([ch, d]) => (
  <path key={ch} d={d} fill={PAL[ch]} />
));

export function PixelMe({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 32"
      shapeRendering="crispEdges"
      role="img"
      aria-label={label}
      className={className}
    >
      {/* sunset sky */}
      <rect width={24} height={8} fill="#3a2a63" />
      <rect y={8} width={24} height={6} fill="#6b3a73" />
      <rect y={14} width={24} height={4} fill="#c25670" />
      <rect y={18} width={24} height={4} fill="#f08a5d" />
      {/* setting sun */}
      <rect x={19} y={16} width={2} height={1} fill="#ffd27a" />
      <rect x={18} y={17} width={4} height={1} fill="#ffd27a" />
      <rect x={17} y={18} width={6} height={4} fill="#ffd27a" />
      {/* canal + railing (a nod to the original photo) */}
      <rect y={22} width={24} height={10} fill="#2d4f86" />
      <rect x={0} y={25} width={3} height={1} fill="#4a72b0" />
      <rect x={20} y={27} width={4} height={1} fill="#4a72b0" />
      <rect x={16} y={22} width={6} height={1} fill="#f0a070" />
      <rect y={23} width={24} height={1} fill="#1b1424" />
      <rect x={0} y={23} width={1} height={9} fill="#1b1424" />
      <rect x={23} y={23} width={1} height={9} fill="#1b1424" />
      {BODY}
      {/* eyelids: hidden, flash on for a blink */}
      <g className="blink" fill={PAL.S}>
        <rect x={9} y={9} width={1} height={1} />
        <rect x={14} y={9} width={1} height={1} />
      </g>
    </svg>
  );
}
