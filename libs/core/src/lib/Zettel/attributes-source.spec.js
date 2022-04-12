import { describe, it, test, expect } from '@jest/globals';
import { Endset, Link } from '../model';
import { LinkPointer, Span } from '../pointers';
import { AttributesSourceFromPointers } from './attributes-source';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';

function makeFromPointers(edl, pointers) {
  return AttributesSourceFromPointers(edl, pointers);
}

function makeLinkWithPointer(i) {
  let pointer = Span("x", 1, 1);
  let endset = Endset(undefined, [pointer]);
  let link = Link(i.toString(), endset);
  let linkPointer = LinkPointer(i.toString());
  return [linkPointer, link];
}

function makeLinks() {
  return [...Array(10).keys()].map(makeLinkWithPointer);
}

function makeEdlZ() {
  let links = makeLinks();
  return makeTestEdlAndEdlZettelFromLinks(links.map(x => x[1]), links.map(x => x[1]));
}

describe('AttributesSourceFromPointers', () => {
  test('edl property set by constructor', () => {
    let edlZ = makeEdlZ();
    expect(makeFromPointers(edlZ).edl).toBe(edlZ);
  });

  test('pointers property set by constructor', () => {
    let edlZ = makeEdlZ();
    let allPointers = edlZ.renderPointers();
    let pointers = [allPointers[3], allPointers[1]];
    expect(makeFromPointers(edlZ, pointers).pointers).toBe(pointers);
  });
});
