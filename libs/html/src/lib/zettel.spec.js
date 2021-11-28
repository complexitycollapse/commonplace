import { describe, it, expect, test } from '@jest/globals';
import { zettel } from './zettel';
import { span, link, endset } from '@commonplace/core';

function make({ edit = span("origin", 1, 10), endsets } = []) {
  if (!endsets) {
    let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
    endsets = [
      { endset: e1, link: link("type1", e1)},
      { endset: e2, link: link("type2", e2)}
    ];
  }

  return zettel(edit, endsets);
}

test('edit returns the passed edit', () => {
  let s = span("a", 1, 2);
  expect(make({edit: s}).edit).toEqual(s);
});

test('link returns the passed link', () => {
  let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
  let endsets = [
    { endset: e1, link: link("type1", e1)},
    { endset: e2, link: link("type2", e2)}
  ];

  expect(make({endsets}).endsets).toEqual(endsets);
});
