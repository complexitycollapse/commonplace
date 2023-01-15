import { describe, it, expect } from '@jest/globals';
import { memoize, mergeObjects, finalObject, decorateObject } from './utils';

describe('decorateObject', () => {
  it('adds new properties to a frozen object', () => {
    let frozen = finalObject({x: 1, y: 2}, {});

    expect(decorateObject(frozen, {z: 3, w: 4})).toMatchObject({z: 3, w: 4});
  });

  it('preserves existing properties of a frozen object', () => {
    let frozen = finalObject({x: 1, y: 2}, {});

    expect(decorateObject(frozen, {z: 3, w: 4})).toMatchObject({x: 1, y: 2});
  });
});

describe('mergeObjects', () => {
  it('adds the source properties to the target, overriding existing values', () => {
    let target = {x: 1, y: 2, z: 3};
    let source = {x: 100, w: 200};

    mergeObjects(target, source);

    expect(target).toEqual({x: 100, y: 2, z: 3, w: 200});
  });
});

describe('memoize', () => {
  it('calls the wrapped function only once', () => {
    let calls = 0;
    let m = memoize(() => ++calls);

    m();
    m();

    expect(calls).toBe(1);
  });

  it('will call the wrapped function again if the memoizer is reset', () => {
    let calls = 0;
    let m = memoize(() => ++calls);

    m();
    m.reset();
    m();

    expect(calls).toBe(2);
  });
});
