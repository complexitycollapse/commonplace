import { expect, test, describe, it } from '@jest/globals';
import { hasEdits } from "./edit.test-helpers";
import { Endset } from './endset';
import { Link, leafDataToLink } from './link';
import { boxTesting } from './box';
import { spanTesting } from './span';
import { LinkPointer, DocPointer } from './pointer';

expect.extend({
  hasEdits
});

let makeSpan = spanTesting.makeSpan;
let makeBox = boxTesting.makeBox;

test('type is set on the link', () => {
  expect(Link("my type").type).toBe("my type");
});

test('endsets is set on the link', () => {
  let endsets = [Endset("foo", [makeSpan()]), Endset("bar", [makeBox()]), Endset(undefined, [LinkPointer("foo"), DocPointer("bar")])];

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
