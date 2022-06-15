import { expect, test, describe, it } from '@jest/globals';
import { End, leafDataToEnd } from './end';
import { Span, spanTesting, Box, LinkPointer, LinkTypePointer, EdlPointer } from "../pointers";

let makeSpans = spanTesting.makeSpans;

test('the passed name becomes the name property', () => {
  expect(End("a name", [LinkPointer("string")], 0).name).toBe("a name");
});

test('the passed pointers becomes the pointers property', () => {
  let pointers = [LinkPointer("string value")];
  expect(End("name", pointers, 0).pointers).toBe(pointers);
});

test('the passed index becomes the index property', () => {
  expect(End("a name", [LinkPointer("string")], 10).index).toBe(10);
});

describe('leafData', () => {
  it('returns object with end name', () => {
    expect(End("foo", makeSpans(5), 0).leafData().name).toBe("foo");
  });

  it('has no name property if the end has no name', () => {
    expect(End(undefined, makeSpans(5), 0).leafData()).not.toHaveProperty("name");
  });

  it('returns ptr array of length n when pointer is an array of length n', () => {
    expect(End("foo", makeSpans(5), 0).leafData().ptr).toHaveLength(5);
  });

  it('returns span serializer data for pointer if it contains a span', () => {
    expect(End("foo", [Span("a", 101, 505)], 0).leafData().ptr[0]).toEqual({
      typ: "span",
      ori: "a",
      st: 101,
      ln: 505
    });
  });

  it('returns box serializer data for ptr if it contains a box', () => {
    expect(End("foo", [Box("a", 101, 505, 22, 33)], 0).leafData().ptr[0]).toEqual({
      typ: "box",
      ori: "a",
      x: 101,
      y: 505,
      wd: 22,
      ht: 33
    });
  });

  it('returns link pointer serializer data for ptr if it contains a link pointer', () => {
    expect(End("foo", [LinkPointer("some string")], 0).leafData().ptr).toEqual([{
      typ: "link",
      name: "some string"
    }]);
  });

  it('returns link type pointer serializer data for ptr if it contains a link type pointer', () => {
    expect(End("foo", [LinkTypePointer("some string")], 0).leafData().ptr).toEqual([{
      typ: "link type",
      name: "some string"
    }]);
  });

  it('returns Edl pointer serializer data for ptr if it contains a edl pointer', () => {
    expect(End("foo", [EdlPointer("some string")], 0).leafData().ptr).toEqual([{
      typ: "edl",
      name: "some string"
    }]);
  });

  it('does not serialize the index property', () => {
    expect(End("foo", [EdlPointer("some string")], 0).leafData()).not.toHaveProperty("index");
  });
});

describe('leafDataToEnd', () => {
  test('is the inverse of leafData() when the end has a name', () => {
    let clips = [...makeSpans(5), Box("o", 1, 4, 5, 7), LinkPointer("link name"), LinkTypePointer("lnk typ"), EdlPointer("edl name")];

    let actual = leafDataToEnd(End("the name", clips, 0).leafData(), 0);

    expect(actual.name).toBe("the name");
    expect(actual.pointers).toEqual(clips);
  });

  test('is the inverse of leafData() when the end has no name', () => {
    let clips = [...makeSpans(5), Box("o", 1, 4, 5, 7), LinkPointer("link name"), LinkTypePointer("lnk typ"), EdlPointer("edl name")];

    let actual = leafDataToEnd(End(undefined, clips, 0).leafData(), 0);

    expect(actual.name).toBeFalsy();
    expect(actual.pointers).toEqual(clips);
  });
});
