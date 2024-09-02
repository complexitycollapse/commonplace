import { describe, it, expect } from 'vitest';
import Interpreter from './interpreter.js';

describe("interpreter", () => {
  it("can be instantiated", () => {
    expect(() => Interpreter()).not.throws();
  });

  it("can create an EdlBuilder", () => {
    const i = Interpreter();
    expect(i.create().edl().builderType).toBe("edl");
  });

  it("sets the depth of a new edl to 0", () => {
    const i = Interpreter();
    expect(i.create().edl().depth).toBe(0);
  });

  it("can create a flight", () => {
    const i = Interpreter();
    expect(i.create().flight().isFlight).toBe(true);
  });

  it("can add an edl to a created flight", () => {
    const i = Interpreter();
    const flight = i.create().flight();
    const edl = i.create().edl();

    flight.addEdl(edl);

    expect(flight.getBuilders()).toEqual([edl]);
  });
});
