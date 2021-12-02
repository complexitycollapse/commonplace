import { expect, test, describe, it } from '@jest/globals';
import { Endset, leafDataToEndset } from './endsets';
import { Span, spanTesting } from "./spans";
import { Box } from "./boxes";

let makeSpans = spanTesting.makeSpans;

test('the passed name becomes the name property', () => {
  expect(Endset("a name", "string").name).toBe("a name");
});

test('the passed string becomes the set property', () => {
  expect(Endset("name", "string value").set).toBe("string value");
});

describe('leafData', () => {
  it('returns array with endset name as first item', () => {
    expect(Endset("foo", "bar").leafData()[0]).toBe("foo");
  });

  it('returns array of length 2 when set is a string', () => {
    expect(Endset("foo", "some set").leafData()).toHaveLength(2);
  });

  it('returns array of length n + 1 when set is an array of length n', () => {
    expect(Endset("foo", makeSpans(5)).leafData()).toHaveLength(6);
  });

  it('returns span serializer data for set if it contains a span', () => {
    expect(Endset("foo", [Span("a", 101, 505)]).leafData()[1]).toEqual({
      typ: "span",
      ori: "a",
      st: 101,
      ln: 505
    });
  });

  it('returns box serializer data for set if it contains a box', () => {
    expect(Endset("foo", [Box("a", 101, 505, 22, 33)]).leafData()[1]).toEqual({
      typ: "box",
      ori: "a",
      x: 101,
      y: 505,
      wd: 22,
      hg: 33
    });
  });

  it('returns original string for set if it is a string', () => {
    expect(Endset("foo", "some string").leafData()[1]).toBe("some string");
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
});

describe('hasEdits', () => {
  it('returns true if the endset contains edits', () => {
    expect(Endset("name", makeSpans(3)).hasEdits).toBeTruthy();
  });

  it('returns false if the endset contains a string', () => {
    expect(Endset("name", "some string").hasEdits).toBeFalsy();
  });
});