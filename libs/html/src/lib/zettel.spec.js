import { describe, it, expect, test } from '@jest/globals';
import { Zettel } from './zettel';
import { Span, Link, Endset, testing } from '@commonplace/core';

let toEqualSpan = testing.spans.toEqualSpan;

expect.extend({
  toEqualSpan
});

function make(edit = Span("origin", 1, 10)) {
  return Zettel(edit);
}

test('edit returns the passed edit', () => {
  let s = Span("a", 1, 2);
  expect(make(s).edit).toEqual(s);
});

describe('addEndset', () => {
  it('adds the given endsets', () => {
    let e1 = Endset("name1", "set1"), e2 = Endset("name2", "set2");
    let l1 = Link("type1", e1), l2 = Link("type2", e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l2);
  
    expect(z.endsets[0]).toEqual(expect.objectContaining({name: e1.name, set: e1.set}));
    expect(z.endsets[1]).toEqual(expect.objectContaining({name: e2.name, set: e2.set}));
  });
  
  it('adds the links as properties to copies of the endsets', () => {
    let e1 = Endset("name1", "set1"), e2 = Endset("name2", "set2");
    let l1 = Link("type1", e1), l2 = Link("type2", e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l2);
  
    expect(z.endsets[0].link).toBe(l1);
    expect(z.endsets[1].link).toBe(l2);
  });
  
  it('does not add link properties to the original endsets', () => {
    let e1 = Endset("name1", "set1"), e2 = Endset("name2", "set2");
    let l1 = Link("type1", e1), l2 = Link("type2", e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l2);
  
    expect(e1).not.toHaveProperty("link");
    expect(e2).not.toHaveProperty("link");
  });

  it('adds the endset index property to copies of the endsets', () => {
    let e1 = Endset("name1", "set1"), e2 = Endset("name2", "set2");
    let l1 = Link("type1", e1, e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l1);
  
    expect(z.endsets[0].index).toBe(0);
    expect(z.endsets[1].index).toBe(1);
  });
  
  it('does not add index property to the original endsets', () => {
    let e1 = Endset("name1", "set1"), e2 = Endset("name2", "set2");
    let l1 = Link("type1", e1, e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l1);
  
    expect(e1).not.toHaveProperty("index");
    expect(e2).not.toHaveProperty("index");
  });
  
  it('will only add an endset once', () => {
    let e1 = Endset("name1", "set1");
    let l1 = Link("type1", e1);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e1, l1);
  
    expect(z.endsets.length).toBe(1);
  });

  it('will add a link twice if it is under different endsets', () => {
    let e1 = Endset("name1", "set1"), e2 = Endset("name2", "set2");
    let l1 = Link("type1", e1, e2);
  
    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l1);
  
    expect(z.endsets.length).toBe(2);
  });
});

describe('addLink', () => {
  it('creates a new zettel with the new link added', () => {
    let s = Span("origin", 1, 10);
    let e1 = Endset("name1", [s]);
    let l1 = Link("type1", e1);
    let l2 = Link("type2", Endset("name2", [s]));
    let zettel = make();
    zettel.addEndset(e1, l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel).toHaveLength(1);
    expect(newZettel[0].endsets).toHaveLength(2);
    expect(newZettel[0].endsets[0].link).toBe(l2);
    expect(newZettel[0].endsets[1].link).toBe(l1);
  });

  it('will split the zettel according to the link spans', () => {
    let s = Span("origin", 1, 10);
    let e1 = Endset("name1", [s]);
    let l1 = Link("type1", e1);
    let l2 = Link("type2", Endset("name2", [s.crop(1)]));
    let zettel = make();
    zettel.addEndset(e1, l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel).toHaveLength(2);

    expect(newZettel[0].endsets).toHaveLength(1);
    expect(newZettel[0].endsets[0].link).toBe(l1);
    expect(newZettel[0].edit).toEqualSpan(s.crop(0, 1));

    expect(newZettel[1].endsets).toHaveLength(2);
    expect(newZettel[1].endsets[0].link).toBe(l2);
    expect(newZettel[1].endsets[1].link).toBe(l1);
    expect(newZettel[1].edit).toEqualSpan(s.crop(1, 9));
  });
});
