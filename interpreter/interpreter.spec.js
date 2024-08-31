import { describe, it, expect } from 'vitest';
import Interpreter from './interpreter.js';

describe("interpreter", () => {
  it("can be instantiated", () => {
    expect(() => Interpreter()).not.throws();
  });

  it("can create an EdlModel", () => {
    const i = Interpreter();
    expect(i.create().edl().modelType).toBe("edl");
  });

  it("sets the depth of a new edl to 0", () => {
    const i = Interpreter();
    expect(i.create().edl().depth).toBe(0);
  });
});
