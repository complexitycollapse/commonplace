import { describe, it, expect, test } from '@jest/globals';
import { PointerTypePointer, leafDataToPointerTypePointer } from './type-pointer';
import { LinkPointer } from './link-pointer';

test('pointerType equals "pointer type"', () => {
  expect(PointerTypePointer("name").pointerType).toBe("pointer type");
});

test('isClip returns false', () => {
  expect(PointerTypePointer("name").isClip).toBeFalsy();
});

test('hashableName returns pointerType and the type name', () => {
  expect(PointerTypePointer("xyz").hashableName).toBe("pointer type:xyz");
});

describe('engulfs', () => {
  it('returns false if the other pointer is not a clip type pointer', () => {
    expect(PointerTypePointer("name").engulfs(LinkPointer("name"))).toBeFalsy();
  });

  it('returns false if the other pointer has a different clip type name', () => {
    expect(PointerTypePointer("name").engulfs(PointerTypePointer("name2"))).toBeFalsy();
  });

  it('returns true if they have the same clip type name', () => {
    expect(PointerTypePointer("name").engulfs(PointerTypePointer("name"))).toBeTruthy();
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
