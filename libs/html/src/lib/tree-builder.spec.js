import { test, expect, describe, it } from '@jest/globals';
import { Zettel } from './zettel';
import { Span, Endset, Link } from '@commonplace/core';
import { TreeBuilder } from './tree-builder';

function makeZettel(start, length) {
  return Zettel(Span("origin", start, length));
}

function makeZettelArray(...array) {
  let result = [];
  while(array.length > 0) {
    result.push(makeZettel(array.shift(), array.shift()));
  }
  return result;
}

function addEndsets(zettel, ...endsetNames) {
  return endsetNames.map(name => addEndset(zettel, name));
}

function addEndset(zettel, endsetName) {
  let endset = Endset(endsetName, []);
  let link = Link("paragraph", endset);
  zettel.addEndset(endset, link);
  return [endset, link];
}

function addExistingEndsets(zettel, endsetsAndLinks){
  endsetsAndLinks.forEach(el => zettel.addEndset(el[0], el[1]));
}

describe('build', () => {
  it('does not change the passed zettel array', () => {
    let zettel = makeZettelArray(1, 10, 20, 10, 30, 10);
    let copy = [...zettel];

    TreeBuilder(zettel, []).build();

    expect(zettel).toEqual(copy);
  });

  it('returns an empty node when there are no Zettel', () => {
    let actual = TreeBuilder([], []).build();

    expect(actual.children).toEqual([]);
  });

  it('returns a node with the passed singleton Zettel as child', () => {
    let zettel = makeZettel(10, 10);
    let actual = TreeBuilder([zettel], []).build();

    expect(actual.children).toEqual([zettel]);
  });

  it("puts the zettel endsets on the node", () => {
    let zettel = makeZettel(10, 10);
    addEndsets(zettel, "foo", "bar", "baz");
    let actual = TreeBuilder([zettel], []).build();

    expect(actual.endsets).toEqual(zettel.endsets);
  });

  it("puts both zettel on the node if they have the same endsets", () => {
    let zettel1 = makeZettel(10, 10);
    let endsets = addEndsets(zettel1, "foo", "bar", "baz");
    let zettel2 = makeZettel(20, 10);
    addExistingEndsets(zettel2, endsets);
    let actual = TreeBuilder([zettel1, zettel2], []).build();

    expect(actual.children[0]).toEqual(zettel1);
    expect(actual.children[1]).toEqual(zettel2);
  });

  it("adds the second zettel to the child if it has more endsets", () => {
    let zettel1 = makeZettel(10, 10);
    let endsets = addEndsets(zettel1, "foo", "bar", "baz");
    let zettel2 = makeZettel(20, 10);
    addExistingEndsets(zettel2, endsets);
    addEndset(zettel2, "quux");
    let actual = TreeBuilder([zettel1, zettel2], []).build();

    expect(actual.children[0]).toEqual(zettel1);
    expect(actual.children[1].children[0]).toEqual(zettel2);
  });

  it("adds the second zettel to the parent if it has fewer endsets", () => {
    let zettel1 = makeZettel(10, 10);
    let endsets = addEndsets(zettel1, "foo", "bar", "baz");
    addEndset(zettel1, "quux");
    let zettel2 = makeZettel(20, 10);
    addExistingEndsets(zettel2, endsets);
    let actual = TreeBuilder([zettel1, zettel2], []).build();

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
    let actual = TreeBuilder([zettel1, zettel2], []).build();

    expect(actual.children[0].children[0]).toEqual(zettel1);
    expect(actual.children[1].children[0]).toEqual(zettel2);
  });
});
