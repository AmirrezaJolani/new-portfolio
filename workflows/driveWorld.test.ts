import assert from "node:assert/strict";
import { test } from "vitest";
import {
  BUILDINGS,
  CARS,
  type Car,
  LANDMARKS,
  PIAZZA,
  padAt,
  padCenter,
  SPAWN,
  solidAt,
  stepCar,
  stickInput,
  TILE,
  tileAt,
} from "./driveWorld";

const idle = { up: false, down: false, left: false, right: false };
const drive = (car: Car, input: Partial<typeof idle>, seconds: number) => {
  for (let i = 0; i < seconds * 60; i++)
    car = stepCar(car, { ...idle, ...input }, 1 / 60);
  return car;
};

test("spawn is on open road", () => {
  assert.equal(tileAt(SPAWN.x / TILE, SPAWN.y / TILE), "road");
  assert.equal(solidAt(SPAWN.x, SPAWN.y), false);
});

test("every pad is reachable ground, not blocked, and maps back to its building", () => {
  for (const b of BUILDINGS) {
    const c = padCenter(b);
    assert.equal(solidAt(c.x, c.y), false, b.id);
    assert.equal(padAt(c.x, c.y), b.id);
  }
});

test("accelerating moves the car forward, and it never enters a building", () => {
  // Spawn faces east along the middle road.
  const moved = drive({ ...SPAWN, speed: 0 }, { up: true }, 1);
  assert.ok(moved.x > SPAWN.x + 50);

  // Drive north from below HOME's pad straight into the house.
  const home = BUILDINGS[0];
  const start = { x: padCenter(home).x, y: 18 * TILE, angle: 0, speed: 0 };
  const end = drive(start, { up: true }, 4);
  assert.ok(end.y > (home.y + home.h) * TILE, "car stopped at the wall");
});

test("joystick steers toward the pushed direction", () => {
  // Car faces up (angle 0); stick pushed right → accelerate + steer right.
  assert.deepEqual(stickInput(1, 0, 0), {
    up: true,
    down: false,
    left: false,
    right: true,
  });
  assert.deepEqual(stickInput(-1, 0, 0), {
    up: true,
    down: false,
    left: true,
    right: false,
  });
  // Already aligned → straight ahead; tiny push → dead zone.
  assert.deepEqual(stickInput(0, -1, 0), {
    up: true,
    down: false,
    left: false,
    right: false,
  });
  assert.equal(stickInput(0.1, 0, 0).up, false);
  // Wrap-around: headings of ±6 rad are just off "up"; the car must take the short turn.
  assert.equal(stickInput(0.2, -1, 6).right, true); // facing up-left, stick up-right
  assert.equal(stickInput(-0.2, -1, -6).left, true); // facing up-right, stick up-left
});

test("the buggy outruns the coupe on sand", () => {
  const sandStart = {
    x: 3 * TILE + 8,
    y: 18 * TILE,
    angle: Math.PI,
    speed: 120,
  };
  const coupe = stepCar(
    sandStart,
    { ...idle, up: true },
    0.1,
    CARS.find((c) => c.id === "coupe"),
  );
  const buggy = stepCar(
    sandStart,
    { ...idle, up: true },
    0.1,
    CARS.find((c) => c.id === "buggy"),
  );
  assert.equal(tileAt(3, 18), "sand");
  assert.ok(buggy.speed > coupe.speed);
});

test("Milan: the piazza is drivable at road speed, landmarks are solid", () => {
  for (const l of LANDMARKS)
    assert.equal(solidAt((l.x + 0.5) * TILE, (l.y + 0.5) * TILE), true, l.kind);
  assert.equal(tileAt(PIAZZA.x, PIAZZA.y), "plaza");
  // Coming off the new south road, a car can drive north onto the piazza.
  const start = { x: 12 * TILE, y: 46 * TILE, angle: 0, speed: 0 };
  assert.equal(solidAt(start.x, start.y), false);
  const end = drive(start, { up: true }, 0.8);
  assert.equal(
    tileAt(Math.floor(end.x / TILE), Math.floor(end.y / TILE)),
    "plaza",
  );
  assert.ok(end.speed > 100, "full road speed on the paving");
});
