import { describe, it, expect, test } from '@jest/globals';
import { EdlPointer, leafDataToEdlPointer } from './edl-pointer';
import { LinkPointer, leafDataToLinkPointer } from './link-pointer';
import { LinkTypePointer, leafDataToLinkTypePointer } from './link-type-pointer';
import { EdlTypePointer, leafDataToEdlTypePointer } from './edl-type-pointer';
import { leafDataToPointer } from './leaf-data-to-pointer';
import { Span } from './span';
import { Box } from './box';

describe('pointerType', () => {
  it('equals "link" for LinkPointer', () => {
    expect(LinkPointer("name").pointerType).toBe("link");
  });

  it('equals "link type" for LinkTypePointer', () => {
    expect(LinkTypePointer("name").pointerType).toBe("link type");
  });

  it('equals "edl" for EdlPointer', () => {
    expect(EdlPointer("name").pointerType).toBe("edl");
  });

  it('equals "edl type" for EdlTypePointer', () => {
    expect(EdlTypePointer("name").pointerType).toBe("edl type");
  });

  it('equals "clip" for Span', () => {
    expect(Span("or", 1, 2).pointerType).toBe("clip");
  });

  it('equals "clip" for Box', () => {
    expect(Box("or", 1, 2, 3, 4).pointerType).toBe("clip");
  });
});

describe('isClip', () => {
  it('returns false for a LinkPointer', () => {
    expect(LinkPointer("link").isClip).toBeFalsy();
  });

  it('returns false for a LinkTypePointer', () => {
    expect(LinkTypePointer("link").isClip).toBeFalsy();
  });

  it('returns false for a EdlPointer', () => {
    expect(EdlPointer("edl").isClip).toBeFalsy();
  });

  it('returns false for a EdlTypePointer', () => {
    expect(EdlTypePointer("edl").isClip).toBeFalsy();
  });

  it('returns true for a Span', () => {
    expect(Span("ori", 10, 20).isClip).toBeTruthy();
  });

  it('returns true for a Box', () => {
    expect(Box("ori", 1, 2, 3, 4).isClip).toBeTruthy();
  });
});

describe('leafData', () => {
  it('returns object with typ "link" and name prop when called on LinkPointer', () => {
    let leafData = LinkPointer("the name").leafData();

    expect(leafData).toEqual({ typ: "link", name: "the name"});
  });

  it('returns object with typ "link" and name and index props when called on LinkPointer with index', () => {
    let leafData = LinkPointer("the name", 123).leafData();

    expect(leafData).toEqual({ typ: "link", name: "the name", idx: 123 });
  });

  it('returns object with typ "link type" and name prop when called on LinkTypePointer', () => {
    let leafData = LinkTypePointer("the name").leafData();

    expect(leafData).toEqual({ typ: "link type", name: "the name"});
  });

  it('returns object with typ "edl" and name prop when called on EdlPointer', () => {
    let leafData = EdlPointer("the name").leafData();

    expect(leafData).toEqual({ typ: "edl", name: "the name"});
  });

  it('returns object with typ "edl type" and name prop when called on EdlTypePointer', () => {
    let leafData = EdlTypePointer("the name").leafData();

    expect(leafData).toEqual({ typ: "edl type", name: "the name"});
  });
});

describe('restoring leafData', () => {
  test('leafDataToLinkPointer is inverse of leafData', () => {
    let link = LinkPointer("test name", 123);

    expect(leafDataToLinkPointer(link.leafData())).toEqual(link);
  });

  test('leafDataToLinkTypePointer is inverse of leafData', () => {
    let link = LinkTypePointer("test name");

    expect(leafDataToLinkTypePointer(link.leafData())).toEqual(link);
  });

  test('leafDataToEdlPointer is inverse of leafData', () => {
    let edl = EdlPointer("test name");

    expect(leafDataToEdlPointer(edl.leafData())).toEqual(edl);
  });

  test('leafDataToEdlTypePointer is inverse of leafData', () => {
    let edl = EdlTypePointer("test name");

    expect(leafDataToEdlTypePointer(edl.leafData())).toEqual(edl);
  });

  test('leafDataToPointer is inverse of leafData for LinkPointer', () => {
    let link = LinkPointer("test name");

    expect(leafDataToPointer(link.leafData())).toEqual(link);
  });

  test('leafDataToPointer is inverse of leafData for LinkTypePointer', () => {
    let link = LinkTypePointer("test name");

    expect(leafDataToPointer(link.leafData())).toEqual(link);
  });

  test('leafDataToPointer is inverse of leafData for EdlPointer', () => {
    let edl = EdlPointer("test name");

    expect(leafDataToPointer(edl.leafData())).toEqual(edl);
  });
});

describe('LinkPointer.hashableName', () => {
  it('returns the link name suffixed with /N if there is no index specified', () => {
    expect(LinkPointer("xyz").hashableName()).toBe("xyz/N");
  });

  it('returns the link name suffixed with the index if there is an index specified', () => {
    expect(LinkPointer("xyz", 123).hashableName()).toBe("xyz/123");
  });
});
