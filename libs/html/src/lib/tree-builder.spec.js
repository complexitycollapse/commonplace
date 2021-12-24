import { expect, describe, it } from '@jest/globals';
import { zettelTesting } from './zettel';
import { TreeBuilder } from './tree-builder';

let addExistingEndsets = zettelTesting.addExistingEndsets;
let makeZettelArray = zettelTesting.makeZettelArray;
let makeZettel = zettelTesting.makeZettel;
let addEndsets = zettelTesting.addEndsets;
let addEndset = zettelTesting.addEndset;

describe('build', () => {
  it('does not change the passed zettel array', () => {
    let zettel = makeZettelArray(1, 10, 20, 10, 30, 10);
    let copy = [...zettel];

    TreeBuilder(zettel).build();

    expect(zettel).toEqual(copy);
  });

  it('returns an empty node when there are no Zettel', () => {
    let actual = TreeBuilder([]).build();

    expect(actual.children).toEqual([]);
  });

  it('returns a node with no links when there are no Zettel', () => {
    let actual = TreeBuilder([]).build();

    expect(actual.endsets).toEqual([]);
  });

  it('returns a node with the passed singleton Zettel as child', () => {
    let zettel = makeZettel(10, 10);
    let actual = TreeBuilder([zettel]).build();

    expect(actual.children).toEqual([zettel]);
  });

  it("puts the zettel endsets on the node", () => {
    let zettel = makeZettel(10, 10);
    addEndsets(zettel, "foo", "bar", "baz");
    let actual = TreeBuilder([zettel]).build();

    expect(actual.endsets).toEqual(zettel.endsets);
  });

  it("puts both zettel on the node if they have the same endsets", () => {
    let zettel1 = makeZettel(10, 10);
    let endsets = addEndsets(zettel1, "foo", "bar", "baz");
    let zettel2 = makeZettel(20, 10);
    addExistingEndsets(zettel2, endsets);
    let actual = TreeBuilder([zettel1, zettel2]).build();

    expect(actual.children[0]).toEqual(zettel1);
    expect(actual.children[1]).toEqual(zettel2);
  });

  it("adds the second zettel to the child if it has more endsets", () => {
    let zettel1 = makeZettel(10, 10);
    let endsets = addEndsets(zettel1, "foo", "bar", "baz");
    let zettel2 = makeZettel(20, 10);
    addExistingEndsets(zettel2, endsets);
    addEndset(zettel2, "quux");
    let actual = TreeBuilder([zettel1, zettel2]).build();

    expect(actual.children[0]).toEqual(zettel1);
    expect(actual.children[1].children[0]).toEqual(zettel2);
  });

  it("adds the second zettel to the parent if it has fewer endsets", () => {
    let zettel1 = makeZettel(10, 10);
    let endsets = addEndsets(zettel1, "foo", "bar", "baz");
    addEndset(zettel1, "quux");
    let zettel2 = makeZettel(20, 10);
    addExistingEndsets(zettel2, endsets);
    let actual = TreeBuilder([zettel1, zettel2]).build();

    expect(actual.children[0].children[0]).toEqual(zettel1);
    expect(actual.children[1]).toEqual(zettel2);
  });

  it("makes the zettel siblings if they have different links", () => {
    let zettel1 = makeZettel(10, 10);
    let endsets = addEndsets(zettel1, "foo", "bar", "baz");
    addEndset(zettel1, "quux1");
    let zettel2 = makeZettel(20, 10);
    addExistingEndsets(zettel2, endsets);
    addEndset(zettel2, "quux2");
    let actual = TreeBuilder([zettel1, zettel2]).build();

    expect(actual.children[0].children[0]).toEqual(zettel1);
    expect(actual.children[1].children[0]).toEqual(zettel2);
  });

  it("parses a tree with multiple levels", () => {
    let zettel1 = makeZettel(10, 10);
    let endsets = addEndsets(zettel1, "foo", "bar");

    let zettel2 = makeZettel(20, 10);
    addExistingEndsets(zettel2, [endsets[0]]);

    let zettel3 = makeZettel(30, 10);
    addExistingEndsets(zettel3, [endsets[0]]);
    let zettel3ExtraEndset = addEndset(zettel3, "baz");
    
    let zettel4 = makeZettel(40, 10);
    addExistingEndsets(zettel4, [endsets[0], zettel3ExtraEndset]);

    let zettel5 = makeZettel(50, 10);
    
    let actual = TreeBuilder([zettel1, zettel2, zettel3, zettel4, zettel5]).build();

    expect(actual.children[0].children[0].children[0]).toEqual(zettel1);
    expect(actual.children[0].children[1]).toEqual(zettel2);
    expect(actual.children[0].children[2].children[0]).toEqual(zettel3);
    expect(actual.children[0].children[2].children[1]).toEqual(zettel4);
    expect(actual.children[1]).toEqual(zettel5);
  });

  it("parses a tree that requires a limited ascent after a descend, with two-level limit violation", () => {
    let zettel1 = makeZettel(10, 10);
    let foo = addEndset(zettel1, "foo");

    let zettel2 = makeZettel(20, 10);
    addExistingEndsets(zettel2, [foo]);
    let bar = addEndset(zettel2, "bar");
    addEndset(zettel2, "baz");

    let zettel3 = makeZettel(30, 10);
    addExistingEndsets(zettel3, [foo, bar]);
    
    let zettel4 = makeZettel(40, 10);

    let actual = TreeBuilder([zettel1, zettel2, zettel3, zettel4]).build();

    expect(actual.children[0].children[0]).toEqual(zettel1);
    expect(actual.children[0].children[1].children[0].children[0]).toEqual(zettel2);
    expect(actual.children[0].children[1].children[1]).toEqual(zettel3);
    expect(actual.children[1]).toEqual(zettel4);
  });

  it("parses a tree that requires a limited ascent after a descend, with one-level limit violation", () => {
    let zettel1 = makeZettel(10, 10);
    let foo = addEndset(zettel1, "foo");

    let zettel2 = makeZettel(20, 10);
    addExistingEndsets(zettel2, [foo]);
    let bar = addEndset(zettel2, "bar");
    addEndset(zettel2, "baz");

    let zettel3 = makeZettel(30, 10);
    addExistingEndsets(zettel3, [foo, bar]);
    
    let zettel4 = makeZettel(40, 10);
    addExistingEndsets(zettel4, [foo]);

    let actual = TreeBuilder([zettel1, zettel2, zettel3, zettel4]).build();

    expect(actual.children[0]).toEqual(zettel1);
    expect(actual.children[1].children[0].children[0]).toEqual(zettel2);
    expect(actual.children[1].children[1]).toEqual(zettel3);
    expect(actual.children[2]).toEqual(zettel4);
  });
});
