import { expect, test, describe, it } from '@jest/globals';
import { Endset, leafDataToEndset } from './endset';
import { Span, spanTesting } from "./span";
import { Box } from "./box";

let makeSpans = spanTesting.makeSpans;

test('the passed name becomes the name property', () => {
  expect(Endset("a name", "string").name).toBe("a name");
});

test('the passed string becomes the set property', () => {
  expect(Endset("name", "string value").set).toBe("string value");
});

describe('leafData', () => {
  it('returns object with endset name', () => {
    expect(Endset("foo", "bar").leafData().name).toBe("foo");
  });

  it('has not name property if the endset has no name', () => {
    expect(Endset(undefined, "bar").leafData()).not.toHaveProperty("name");
  });

  it('returns ptr array of length n when set is an array of length n', () => {
    expect(Endset("foo", makeSpans(5)).leafData().ptr).toHaveLength(5);
  });

  it('returns span serializer data for set if it contains a span', () => {
    expect(Endset("foo", [Span("a", 101, 505)]).leafData().ptr[0]).toEqual({
      typ: "span",
      ori: "a",
      st: 101,
      ln: 505
    });
  });

  it('returns box serializer data for ptr if it contains a box', () => {
    expect(Endset("foo", [Box("a", 101, 505, 22, 33)]).leafData().ptr[0]).toEqual({
      typ: "box",
      ori: "a",
      x: 101,
      y: 505,
      wd: 22,
      hg: 33
    });
  });

  it('returns original string for ptr if it is a string', () => {
    expect(Endset("foo", "some string").leafData().ptr).toBe("some string");
  });
});

describe('leafDataToEndset is inverse of leafData', () => {
  test('edits case', () => {
    let edits = [...makeSpans(5), Box("o", 1, 4, 5, 7)];

    let actual = leafDataToEndset(Endset("the name", edits).leafData());

    expect(actual.name).toBe("the name");
    expect(actual.set).toEqual(edits);
  });

  test('string case', () => {
    let actual = leafDataToEndset(Endset("the name", "the string").leafData());

    expect(actual.name).toBe("the name");
    expect(actual.set).toEqual("the string");
  });

  test('no name case', () => {
    let actual = leafDataToEndset(Endset(undefined, "the string").leafData());

    expect(actual.name).toBeFalsy();
    expect(actual.set).toEqual("the string");
  });
});

describe('hasEdits', () => {
  it('returns true if the endset contains edits', () => {
    expect(Endset("name", makeSpans(3)).hasEdits).toBeTruthy();
  });

  it('returns false if the endset contains a string', () => {
    expect(Endset("name", "some string").hasEdits).toBeFalsy();
  });
});