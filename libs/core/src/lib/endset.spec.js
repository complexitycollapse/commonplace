import { expect, test, describe, it } from '@jest/globals';
import { Endset, leafDataToEndset } from './endset';
import { Span, spanTesting } from "./span";
import { Box } from "./box";
import { LinkPointer, LinkTypePointer, EdlPointer } from "./pointer";

let makeSpans = spanTesting.makeSpans;

test('the passed name becomes the name property', () => {
  expect(Endset("a name", [LinkPointer("string")]).name).toBe("a name");
});

test('the passed pointers becomes the pointers property', () => {
  let pointers = [LinkPointer("string value")];
  expect(Endset("name", pointers).pointers).toBe(pointers);
});

describe('leafData', () => {
  it('returns object with endset name', () => {
    expect(Endset("foo", makeSpans(5)).leafData().name).toBe("foo");
  });

  it('has no name property if the endset has no name', () => {
    expect(Endset(undefined, makeSpans(5)).leafData()).not.toHaveProperty("name");
  });

  it('returns ptr array of length n when pointer is an array of length n', () => {
    expect(Endset("foo", makeSpans(5)).leafData().ptr).toHaveLength(5);
  });

  it('returns span serializer data for pointer if it contains a span', () => {
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
      ht: 33
    });
  });

  it('returns link pointer serializer data for ptr if it contains a link pointer', () => {
    expect(Endset("foo", [LinkPointer("some string")]).leafData().ptr).toEqual([{
      typ: "link",
      name: "some string"
    }]);
  });

  it('returns link type pointer serializer data for ptr if it contains a link type pointer', () => {
    expect(Endset("foo", [LinkTypePointer("some string")]).leafData().ptr).toEqual([{
      typ: "link type",
      name: "some string"
    }]);
  });

  it('returns Edl pointer serializer data for ptr if it contains a edl pointer', () => {
    expect(Endset("foo", [EdlPointer("some string")]).leafData().ptr).toEqual([{
      typ: "edl",
      name: "some string"
    }]);
  });
});

describe('leafDataToEndset is inverse of leafData', () => {
  test('named case', () => {
    let clips = [...makeSpans(5), Box("o", 1, 4, 5, 7), LinkPointer("link name"), LinkTypePointer("lnk typ"), EdlPointer("edl name")];

    let actual = leafDataToEndset(Endset("the name", clips).leafData());

    expect(actual.name).toBe("the name");
    expect(actual.pointers).toEqual(clips);
  });

  test('no name case', () => {
    let clips = [...makeSpans(5), Box("o", 1, 4, 5, 7), LinkPointer("link name"), LinkTypePointer("lnk typ"), EdlPointer("edl name")];

    let actual = leafDataToEndset(Endset(undefined, clips).leafData());

    expect(actual.name).toBeFalsy();
    expect(actual.pointers).toEqual(clips);
  });
});
