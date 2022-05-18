import { describe, it, expect, test } from '@jest/globals';
import { ClipTypePointer, leafDataToClipTypePointer } from './type-pointer';
import { LinkPointer } from './link-pointer';

test('pointerType equals "endset"', () => {
  expect(ClipTypePointer("name").pointerType).toBe("clip type");
});

test('isClip returns false', () => {
  expect(ClipTypePointer("name").isClip).toBeFalsy();
});

test('hashableName returns clipType and the type name', () => {
  expect(ClipTypePointer("xyz").hashableName).toBe("clip type:xyz");
});

describe('engulfs', () => {
  it('returns false if the other pointer is not a clip type pointer', () => {
    expect(ClipTypePointer("name").engulfs(LinkPointer("name"))).toBeFalsy();
  });

  it('returns false if the other pointer has a different clip type name', () => {
    expect(ClipTypePointer("name").engulfs(ClipTypePointer("name2"))).toBeFalsy();
  });

  it('returns true if they have the same clip type name', () => {
    expect(ClipTypePointer("name").engulfs(ClipTypePointer("name"))).toBeTruthy();
  });
});

describe('leafDataToClipTypePointer', () => {
  it('is the inverse of leafData', () => {
    let pointer = ClipTypePointer("test type name");

    expect(leafDataToClipTypePointer(pointer.leafData())).toEqual(pointer);
  });
});

describe('leafData', () => {
  it('returns object with typ "clip type" and name prop when called on ClipTypePointer', () => {
    let leafData = ClipTypePointer("type name").leafData();

    expect(leafData).toEqual({ typ: "clip type", name: "type name"});
  });
});
