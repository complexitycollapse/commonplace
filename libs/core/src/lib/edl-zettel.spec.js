import { describe, expect, it } from '@jest/globals';
import { Link } from './link';
import { Edl } from './edl';
import { EdlZettel } from './edl-zettel';
import { Endset } from './endset';
import { RenderEndset } from './render-endset';
import { RenderLink } from './render-link';

function make(edl, {endsets, key} = {}) {
  endsets = endsets ?? makeEndsets("a", "b", "c");
  key = key ?? "testKey";
  return EdlZettel(edl, endsets, key);
}

function emptyEdl() {
  return Edl(undefined, [], []);
}

function makeEndsets(...linkTypes) {
  return linkTypes.map(t => {
    let endset = Endset(undefined, []);
    return RenderEndset(endset, RenderLink(Link(t, endset)));
  });
}

describe('basic properties', () => {
  it('sets the key property', () => {
    expect(make(emptyEdl(), { key: "123" }).key).toBe("123");
  });

  it('sets the endsets property', () => {
    let endsets = makeEndsets("a", "b", "c");
    expect(make(emptyEdl(), { endsets }).endsets).toBe(endsets);
  });
});
