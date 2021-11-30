import { expect, test, describe, it } from '@jest/globals';
import { hasEdits } from "./edits.test-helpers";
import { endset } from './endsets';
import { link, leafDataToLink } from './links';
import { box } from './boxes';
import { spanTesting } from './spans';

expect.extend({
  hasEdits
});

let makeSpan = spanTesting.makeSpan;

test('type is set on the link', () => {
  expect(link("my type").type).toBe("my type");
});

test('endsets is set on the link', () => {
  let endsets = [endset("foo", "1"), endset("bar", "2"), endset("baz", "3")];

  let lk = link("my type", ...endsets);

  expect(lk.endsets.length).toBe(3);
  expect(lk.endsets[0]).toEqual(endsets[0]);
  expect(lk.endsets[1]).toEqual(endsets[1]);
  expect(lk.endsets[2]).toEqual(endsets[2]);
});

describe('leafData', () => {
  it('has the type and endsets properties', () => {
    expect(link("type").leafData()).toEqual({
      typ: "type",
      es: []
    });
  });

  it('has no own properties other than type and endset', () => {
    expect(Object.getOwnPropertyNames(link("type").leafData())).toHaveLength(2);
  });

  it('converts the endsets to their serialized form', () => {
    let es = endset("Name", []);
    expect(link("type", es).leafData().es[0]).toEqual(es.leafData());
  });
});

test('leafDataToLink is inverse of leafData', () => {
  let l = link("my type", endset("name1", "foo"), endset("name2", [makeSpan(), box("orig", 1, 2, 3, 4)]));
  expect(leafDataToLink(l.leafData())).toEqual(l);
});
