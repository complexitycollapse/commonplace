import { describe, it, expect } from '@jest/globals';
import { mergeObjects } from './utils';

describe('mergeObjects', () => {
  it('adds the source properties to the target, overriding existing values', () => {
    let target = {x: 1, y: 2, z: 3};
    let source = {x: 100, w: 200};

    mergeObjects(target, source);

    expect(target).toEqual({x: 100, y: 2, z: 3, w: 200});
  });
});
