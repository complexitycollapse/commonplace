import { expect, test, describe, it } from '@jest/globals';
import { hasEdits } from "./edits.test-helpers";
import { endset } from './endsets';
import { link } from './links';

expect.extend({
  hasEdits
});

test('type is set on the link', () => {
  expect(link("my type").type).toBe("my type");
});

test('endsets is set on the link', () => {
  let endsets = [endset("foo"), endset("bar"), endset("baz")];

  let lk = link("my type", ...endsets);

  expect(lk.endsets.length).toBe(3);
  expect(lk.endsets[0].name).toBe("foo");
  expect(lk.endsets[1].name).toBe("bar");
  expect(lk.endsets[2].name).toBe("baz");
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
