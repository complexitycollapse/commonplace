import { expect, test, describe, it } from '@jest/globals';
import { hasClips, boxTesting, Span, spanTesting, LinkPointer, LinkTypePointer, EdlPointer } from "../pointers";
import { Endset } from './endset';
import { Link, leafDataToLink } from './link';

expect.extend({
  hasClips
});

let makeSpan = spanTesting.makeSpan;
let makeBox = boxTesting.makeBox;

test('type is set on the link', () => {
  expect(Link("my type").type).toBe("my type");
});

test('isLink is true', () => {
  expect(Link("myType").isLink).toBeTruthy();
});

test('isClip is false', () => {
  expect(Link("myType").isClip).toBeFalsy();
});

test('endsets is set on the link', () => {
  let endsets = [
    Endset("foo", [makeSpan()]),
    Endset("bar", [makeBox()]),
    Endset(undefined, [LinkPointer("foo"), EdlPointer("bar"), LinkTypePointer("baz")])
  ];

  let lk = Link("my type", ...endsets);

  expect(lk.endsets.length).toBe(3);
  expect(lk.endsets[0]).toEqual(endsets[0]);
  expect(lk.endsets[1]).toEqual(endsets[1]);
  expect(lk.endsets[2]).toEqual(endsets[2]);
});

describe('leafData', () => {
  it('has the type and endsets properties', () => {
    expect(Link("type").leafData()).toEqual({
      typ: "type",
      es: []
    });
  });

  it('has no own properties other than type and endset', () => {
    expect(Object.getOwnPropertyNames(Link("type").leafData())).toHaveLength(2);
  });

  it('converts the endsets to their serialized form', () => {
    let es = Endset("Name", []);
    expect(Link("type", es).leafData().es[0]).toEqual(es.leafData());
  });
});

test('leafDataToLink is inverse of leafData', () => {
  let l = Link("my type", Endset("name1", [makeSpan()]), Endset("name2", [makeBox(), makeSpan()]));
  expect(leafDataToLink(l.leafData())).toEqual(l);
});

test('leafDataToLink can convert an array to an array of links', () => {
  let expectedLinks = [Link("t1", Endset("e1", [Span("x", 1, 2)])), Link("t2", Endset("e2", [Span("y", 3, 4)]))];
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
