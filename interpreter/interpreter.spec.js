import { describe, it, expect } from 'vitest';
import Interpreter from './interpreter.js';

describe("interpreter", () => {
  it("can be instantiated", () => {
    expect(() => Interpreter()).not.throws();
  });
});
