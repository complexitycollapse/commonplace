import { test, expect, describe, it } from '@jest/globals';
import { Zettel } from './zettel';
import { Span } from '@commonplace/core';
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
  })
});