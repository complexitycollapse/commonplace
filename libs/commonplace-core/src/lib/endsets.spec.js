import { expect, test, describe, it } from '@jest/globals';
import { endset } from './endsets';
import { span } from "./spans";
import { box } from "./boxes";
import { makeSpans } from "./edits.test-helpers";

test('the passed name becomes the name property', () => {
  expect(endset("a name").name).toBe("a name");
});

test('the passed string becomes the set property', () => {
  expect(endset("name", "string value").set).toBe("string value");
});

describe('leafData', () => {
  it('returns array with endset name as first item', () => {
    expect(endset("foo", "bar").leafData()[0]).toEqual("foo");
  });

  it('returns array of length 2 when set is a string', () => {
    expect(endset("foo", "some set").leafData()).toHaveLength(2);
  });

  it('returns array of length n + 1 when set is an array of length n', () => {
    expect(endset("foo", makeSpans(5)).leafData()).toHaveLength(6);
  });

  it('returns span serializer data for set if it contains a span', () => {
    expect(endset("foo", [span("a", 101, 505)]).leafData()[1]).toEqual({
      typ: "span",
      ori: "a",
      st: 101,
      ln: 505
    });
  });

  it('returns box serializer data for set if it contains a box', () => {
    expect(endset("foo", [box("a", 101, 505, 22, 33)]).leafData()[1]).toEqual({
      typ: "box",
      ori: "a",
      x: 101,
      y: 505,
      wd: 22,
      hg: 33
    });
  });

  it('returns original string for set if it is a string', () => {
    expect(endset("foo", "some string").leafData()[1]).toBe("some string");
  });
});
