import { describe, it, expect, test } from '@jest/globals';
import { zettel } from './zettel';
import { span, link, endset } from '@commonplace/core';

function make(edit = span("origin", 1, 10)) {
  return zettel(edit);
}

test('edit returns the passed edit', () => {
  let s = span("a", 1, 2);
  expect(make(s).edit).toEqual(s);
});

describe('addLink', () => {
  it('adds the given endsets', () => {
    let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
    let l1 = link("type1", e1), l2 = link("type2", e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l2);
  
    expect(z.endsets[0]).toEqual(expect.objectContaining({name: e1.name, set: e1.set}));
    expect(z.endsets[1]).toEqual(expect.objectContaining({name: e2.name, set: e2.set}));
  });
  
  it('adds the links as properties to copies of the endsets', () => {
    let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
    let l1 = link("type1", e1), l2 = link("type2", e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l2);
  
    expect(z.endsets[0].link).toBe(l1);
    expect(z.endsets[1].link).toBe(l2);
  });
  
  it('does not add link properties to the original endsets', () => {
    let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
    let l1 = link("type1", e1), l2 = link("type2", e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l2);
  
    expect(e1).not.toHaveProperty("link");
    expect(e2).not.toHaveProperty("link");
  });

  it('adds the endset index property to copies of the endsets', () => {
    let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
    let l1 = link("type1", e1, e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l1);
  
    expect(z.endsets[0].index).toBe(0);
    expect(z.endsets[1].index).toBe(1);
  });
  
  it('does not add index property to the original endsets', () => {
    let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
    let l1 = link("type1", e1, e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l1);
  
    expect(e1).not.toHaveProperty("index");
    expect(e2).not.toHaveProperty("index");
  });
  
  it('will only add an endset once', () => {
    let e1 = endset("name1", "set1");
    let l1 = link("type1", e1);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e1, l1);
  
    expect(z.endsets.length).toBe(1);
  });

  it('will add a link twice if it is under different endsets', () => {
    let e1 = endset("name1", "set1"), e2 = endset("name2", "set2");
    let l1 = link("type1", e1, e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l1);
  
    expect(z.endsets.length).toBe(2);
  });
});
