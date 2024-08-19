import { describe, it, expect } from 'vitest';
import { EdlPointer } from './edl-pointer';

describe('nibble', () => {
  it('returns [true, undefined] if the given pointer is to the same EDL', () => {
    expect(EdlPointer("foo").nibble(EdlPointer("foo"))).toEqual({ nibbled: true, remainder: undefined });
  });

  it('returns [false, undefined] if the given pointer is to a different EDL', () => {
    expect(EdlPointer("foo1").nibble(EdlPointer("foo2"))).toEqual({ nibbled: false, remainder: undefined});
  });
});