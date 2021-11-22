import { expect, test } from '@jest/globals';
import { hasEdits } from "./edits.test-helpers";
import { endset } from './endsets';
import { link } from './links';

expect.extend({
  hasEdits
});

test('type is set on the link', () => {
  expect(link("my type").type).toEqual("my type");
});

test('endsets is set on the link', () => {
  let endsets = [endset("foo"), endset("bar"), endset("baz")];

  let lk = link("my type", ...endsets);

  expect(lk.endsets.length).toEqual(3);
  expect(lk.endsets[0].name).toEqual("foo");
  expect(lk.endsets[1].name).toEqual("bar");
  expect(lk.endsets[2].name).toEqual("baz");
});
