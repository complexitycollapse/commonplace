import { expect, test, describe, it } from '@jest/globals';
import { hasClips, boxTesting, Span, spanTesting, LinkPointer, LinkTypePointer, EdlPointer } from "../pointers";
import { End } from './end';
import { Link, leafDataToLink, DirectMetalink, directMetalinkType, ContentMetalink, contentMetalinkType } from './link';

expect.extend({
  hasClips
});

let makeSpan = spanTesting.makeSpan;
let makeBox = boxTesting.makeBox;

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
    ["bar", [makeBox()]],
    [undefined, [LinkPointer("foo"), EdlPointer("bar"), LinkTypePointer("baz")]]
  ];

  let lk = Link("my type", ...ends);

  expect(lk.ends.length).toBe(3);
  expect(toSpec(lk.ends[0])).toEqual(ends[0]);
  expect(toSpec(lk.ends[1])).toEqual(ends[1]);
  expect(toSpec(lk.ends[2])).toEqual(ends[2]);
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
  let l = Link("my type", ["name1", [makeSpan()]], ["name2", [makeBox(), makeSpan()]]);
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

describe('DirectMetalink', () => {
  it('returns a link of the direct metalink type', () => {
    expect(DirectMetalink().type).toBe(directMetalinkType);
  });

  it('sets ends on the link from the ends parameters', () => {
    let ends = [
      ["foo", [makeSpan()]],
      ["bar", [makeBox()]],
      [undefined, [LinkPointer("foo"), EdlPointer("bar"), LinkTypePointer("baz")]]
    ];
  
    let lk = DirectMetalink(...ends);
  
    expect(lk.ends.length).toBe(3);
    expect(toSpec(lk.ends[0])).toEqual(ends[0]);
    expect(toSpec(lk.ends[1])).toEqual(ends[1]);
    expect(toSpec(lk.ends[2])).toEqual(ends[2]);
  });
});

describe('ContentMetalink', () => {
  it('returns a link of the content metalink type', () => {
    expect(ContentMetalink().type).toBe(contentMetalinkType);
  });

  it('sets ends on the link from the ends parameters', () => {
    let ends = [
      ["foo", [makeSpan()]],
      ["bar", [makeBox()]],
      [undefined, [LinkPointer("foo"), EdlPointer("bar"), LinkTypePointer("baz")]]
    ];
  
    let lk = ContentMetalink(...ends);
  
    expect(lk.ends.length).toBe(3);
    expect(toSpec(lk.ends[0])).toEqual(ends[0]);
    expect(toSpec(lk.ends[1])).toEqual(ends[1]);
    expect(toSpec(lk.ends[2])).toEqual(ends[2]);
  });
});
