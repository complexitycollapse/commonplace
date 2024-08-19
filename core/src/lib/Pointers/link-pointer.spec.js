import { describe, it, expect } from 'vitest';
import { LinkPointer } from './link-pointer';

describe('nibble', () => {
  it('returns [true, undefined] if the given pointer is to the same EDL', () => {
    expect(LinkPointer("foo").nibble(LinkPointer("foo"))).toEqual({ nibbled: true, remainder: undefined });
  });

  it('returns [false, undefined] if the given pointer is to a different EDL', () => {
    expect(LinkPointer("foo1").nibble(LinkPointer("foo2"))).toEqual({ nibbled: false, remainder: undefined});
  });
});
