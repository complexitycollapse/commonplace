import { describe, it, expect, test } from '@jest/globals';
import { zettel } from './zettel';
import { span, link, endset } from '@commonplace/core';

function make({ edit = span("origin", 1, 10), endsets } = []) {
  if (!endsets) {
    let e1 = endset("nameA", "setA"), e2 = endset("nameB", "setB");
    endsets = [
      { endset: e1, link: link("typeA", e1)},
      { endset: e2, link: link("typeB", e2)}
    ];
  }

  return zettel(edit, endsets);
}

test('edit returns the passed edit', () => {
  let s = span("a", 1, 2);
  expect(make({ edit: s }).edit).toEqual(s);
});

test('endsets returns the passed endsets', () => {
  let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
  let pairs = [
    { endset: e1, link: link("type1", e1)},
    { endset: e2, link: link("type2", e2)}
  ];

  let z = make({ endsets: pairs });

  expect(z.endsets[0]).toEqual(expect.objectContaining({name: e1.name, set: e1.set}))
  expect(z.endsets[1]).toEqual(expect.objectContaining({name: e2.name, set: e2.set}))
});

test('the passed links become properties on the endsets', () => {
  let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
  let l1 = link("type1", e1), l2 = link("type2", e2);
  let pairs = [
    { endset: e1, link: l1 },
    { endset: e2, link: l2 }
  ];

  let z = make({ endsets: pairs });

  expect(z.endsets[0].link).toBe(l1);
  expect(z.endsets[1].link).toBe(l2);
});

test('the original endsets are not modified with link properties', () => {
  let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
  let l1 = link("type1", e1), l2 = link("type2", e2);
  let pairs = [
    { endset: e1, link: l1 },
    { endset: e2, link: l2 }
  ];

  make({ endsets: pairs });

  expect(e1).not.toHaveProperty("link");
  expect(e2).not.toHaveProperty("link");
});
