import { expect, test, describe, it } from '@jest/globals';
import { hasEdits } from "./edit.test-helpers";
import { Endset } from './endset';
import { Link, leafDataToLink } from './link';
import { Box } from './box';
import { spanTesting } from './span';

expect.extend({
  hasEdits
});

let makeSpan = spanTesting.makeSpan;

test('type is set on the link', () => {
  expect(Link("my type").type).toBe("my type");
});

test('endsets is set on the link', () => {
  let endsets = [Endset("foo", "1"), Endset("bar", "2"), Endset("baz", "3")];

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
  let l = Link("my type", Endset("name1", "foo"), Endset("name2", [makeSpan(), Box("orig", 1, 2, 3, 4)]));
  expect(leafDataToLink(l.leafData())).toEqual(l);
});
