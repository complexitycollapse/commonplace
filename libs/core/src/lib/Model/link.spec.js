import { expect, test, describe, it } from '@jest/globals';
import { hasClips, imageTesting, Span, spanTesting, LinkPointer, EdlPointer } from "../pointers";
import { End } from './end';
import { Link, leafDataToLink } from './link';

expect.extend({
  hasClips
});

let makeSpan = spanTesting.makeSpan;
let makeImage = imageTesting.makeImage;

function toSpec(end) {
  return [end.name, end.pointers];
}

test('type is set on the link', () => {
  expect(Link("my type").type).toBe("my type");
});

test('isLink is true', () => {
  expect(Link("myType").isLink).toBeTruthy();
});

test('isClip is false', () => {
  expect(Link("myType").isClip).toBeFalsy();
});

test('ends is set on the link', () => {
  let ends = [
    ["foo", [makeSpan()]],
    ["bar", [makeImage()]],
    [undefined, [LinkPointer("foo"), EdlPointer("bar")]]
  ];

  let lk = Link("my type", ...ends);

  expect(lk.ends.length).toBe(3);
  expect(toSpec(lk.ends[0])).toEqual(ends[0]);
  expect(toSpec(lk.ends[1])).toEqual(ends[1]);
});

describe('leafData', () => {
  it('has the type and ends properties', () => {
    expect(Link("type").leafData()).toEqual({
      typ: "type",
      es: []
    });
  });

  it('has no own properties other than type and end', () => {
    expect(Object.getOwnPropertyNames(Link("type").leafData())).toHaveLength(2);
  });

  it('converts the ends to their serialized form', () => {
    let end = End("Name", [], 0);
    expect(Link("type", toSpec(end)).leafData().es[0]).toEqual(end.leafData());
  });
});

test('leafDataToLink is inverse of leafData', () => {
  let l = Link("my type", ["name1", [makeSpan()]], ["name2", [makeImage(), makeSpan()]]);
  expect(leafDataToLink(l.leafData())).toEqual(l);
});

test('leafDataToLink can convert an array to an array of links', () => {
  let expectedLinks = [Link("t1", ["e1", [Span("x", 1, 2)]]), Link("t2", ["e2", [Span("y", 3, 4)]])];
  let leafData = [
    {
      "typ": "t1",
      "es": [{ "name": "e1", "ptr": [{ "typ": "span", "ori": "x", "st": 1, "ln": 2 }] }]
    },
    {
      "typ": "t2",
      "es": [{ "name": "e2", "ptr": [{ "typ": "span", "ori": "y", "st": 3, "ln": 4 }] }]
    }
  ];

  let actualLinks = leafDataToLink(leafData);

  expect(actualLinks).toEqual(expectedLinks);
});

describe('clipSource', () => {
  it('returns a function', () => {
    expect(typeof Link().clipSource()).toBe('function');
  });

  it('returns undefined on first call', () => {
    let link = Link();
    let source = link.clipSource();
    expect(source()).toBeUndefined();
  });
});

describe('getEnd', () => {
  it('returns undefined if there is no end with the given name', () => {
    let link = Link(undefined, ["foo", []], ["bar", []]);

    expect(link.getEnd("quux")).toBe(undefined);
  });

  it('returns end if there is an end with the given name', () => {
    let link = Link(undefined, ["foo", []], ["bar", []]);

    expect(link.getEnd("bar")).toBe(link.ends[1]);
  });

  it('returns a subsequent end if the index is positive', () => {
    let link = Link(undefined, ["foo", []], ["foo", []]);

    expect(link.getEnd("foo", 1)).toBe(link.ends[1]);
    expect(link.getEnd("foo", 1)).not.toBe(link.ends[0]);
  });

  it('returns undefined if the index is equal or higher than the number of matching ends', () => {
    let link = Link(undefined, ["foo", []], ["foo", []]);

    expect(link.getEnd("foo", 2)).toBe(undefined);
  });
});
