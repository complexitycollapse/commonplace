import { describe, it, expect, test } from '@jest/globals';
import { PointerTypePointer, leafDataToPointerTypePointer } from './type-pointer';
import { LinkPointer } from './link-pointer';
import { EdlPointer } from './edl-pointer';

test('pointerType equals "pointer type"', () => {
  expect(PointerTypePointer("name").pointerType).toBe("pointer type");
});

test('isClip returns false', () => {
  expect(PointerTypePointer("name").isClip).toBeFalsy();
});

test('hashableName returns pointerType and the type name', () => {
  expect(PointerTypePointer("xyz").hashableName).toBe("pointer type:xyz");
});

describe('endowsTo', () => {
  it('returns false if the other pointer does not have the specified pointer type', () => {
    expect(PointerTypePointer("link").endowsTo(EdlPointer("foo"))).toBeFalsy();
  });

  it('returns true if the other pointer does have the same pointer type', () => {
    expect(PointerTypePointer("link").endowsTo(LinkPointer("foo"))).toBeTruthy();
  });
});

describe('leafDataToPointerTypePointer', () => {
  it('is the inverse of leafData', () => {
    let pointer = PointerTypePointer("test type name");

    expect(leafDataToPointerTypePointer(pointer.leafData())).toEqual(pointer);
  });
});

describe('leafData', () => {
  it('returns object with typ "pointer type" and name prop when called on PointerTypePointer', () => {
    let leafData = PointerTypePointer("type name").leafData();

    expect(leafData).toEqual({ typ: "pointer type", name: "type name"});
  });
});
