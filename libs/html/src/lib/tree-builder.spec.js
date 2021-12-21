import { test, expect, describe, it } from '@jest/globals';
import { Zettel } from './zettel';
import { Span } from '@commonplace/core';
import { TreeBuilder } from './tree-builder';

function makeZettel(start, length) {
  return Zettel(Span("origin", start, length));
}

function makeZettelArray(...array) {
  return array.map(x => makeZettel(x[0], x[1]));
}

describe('build', () => {
  it('does not change the passed zettel array', () => {
    let zettel = makeZettelArray(1, 10, 20, 10, 30, 10);
    let copy = [...zettel];

    TreeBuilder(zettel).build();

    expect(zettel).toEqual(copy);
  });
});
