import assert from "node:assert/strict";
import test from "node:test";
import { newState, update } from "./engine.js";

const noAudio = { beep() {} };

function createState(head, tracks) {
  const state = newState({
    mode: "endless",
    N: "100",
    rate: "0.2",
    pmin: "5",
    pmax: "10",
    svcT: "0",
  });
  state.head = head;
  state.next = 10;
  state.reqs = tracks.map((track, id) => ({
    id,
    track,
    ang: 0,
    max: 100,
    life: 100,
    born: 0,
    kit: false,
  }));
  return state;
}

function step(state, algorithm) {
  update(state, 0.05, algorithm, 1, noAudio);
}

test("SCAN travels to the disk edge before reversing", () => {
  const state = createState(50, [10]);

  step(state, 3);

  assert.equal(state.dir, 1);
  assert.ok(Math.abs(state.head - 51.1) < 1e-9);
});

test("SCAN reverses direction after reaching the edge", () => {
  const state = createState(99, [10]);

  step(state, 3);

  assert.equal(state.dir, -1);
  assert.ok(Math.abs(state.head - 97.9) < 1e-9);
});

test("C-SCAN travels to the upper edge before wrapping", () => {
  const state = createState(50, [10]);

  step(state, 4);

  assert.equal(state.dir, 1);
  assert.ok(Math.abs(state.head - 51.1) < 1e-9);
  assert.ok(Math.abs(state.thm - 1.1) < 1e-9);
});

test("C-SCAN counts the full return jump from the upper edge to track zero", () => {
  const state = createState(99, [10]);

  step(state, 4);

  assert.equal(state.dir, 1);
  assert.ok(Math.abs(state.head - 1.1) < 1e-9);
  assert.ok(Math.abs(state.thm - 100.1) < 1e-9);
});
