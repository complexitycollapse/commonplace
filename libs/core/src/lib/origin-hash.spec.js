import { describe, it, expect } from '@jest/globals';
import { OriginHash } from './origin-hash';
import { Span } from './span';

describe('get', () => {
  it("returns an empty list if the key doesn't exist", () => {
    expect(OriginHash().get("whatever")).toEqual([]);
  });
});

describe('add', () => {
  it('returns the hash', () => {
    let hash = OriginHash();
    expect(hash.add("key", "value")).toBe(hash);
  });

  it('adds the value to the hash', () => {
    let hash = OriginHash().add("k", "item");

    expect(hash.get("k")).toEqual(["item"]);
  });

  it('adds appends subsequent values of the same key to the list', () => {
    let hash = OriginHash().add("k", "item1").add("k", "item2").add("k", "item3");

    expect(hash.get("k")).toEqual(["item1", "item2", "item3"]);
  });
});

describe('addEdit', () => {
  it('adds an edit under its origin', () => {
    let edit = Span("orig", 1, 10);

    let hash = OriginHash().addEdit(edit);

    expect(hash.get(edit.origin)).toEqual([edit]);
  });
});
