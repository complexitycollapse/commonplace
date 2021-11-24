import { expect, test } from '@jest/globals';
import { hasEdits, makeSpans, toEqualSpan } from "./edits.test-helpers";
import { link } from './links';
import { doc } from './docs';

expect.extend({
  hasEdits,
  toEqualSpan
});

test('edits is set on the doc', () => {
  let spans = makeSpans(3);

  let d = doc(spans);

  expect(d.edits.length).toEqual(3);
  expect(d.edits[0]).toEqualSpan(spans[0]);
  expect(d.edits[1]).toEqualSpan(spans[1]);
  expect(d.edits[2]).toEqualSpan(spans[2]);
});

test('edits is set on the doc', () => {
  let links = [link("1"), link("2"), link("3")];

  let d = doc([], links);

  expect(d.links.length).toEqual(3);
  expect(d.links[0]).toBe(links[0]);
  expect(d.links[1]).toBe(links[1]);
  expect(d.links[2]).toBe(links[2]);
});
