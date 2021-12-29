import { describe, it, expect, test } from '@jest/globals';
import { LinkPointer, LinkTypePointer, DocPointer, leafDataToLinkPointer, leafDataToLinkTypePointer, leafDataToDocPointer } from './pointer';
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

  it('equals "doc" for DocPointer', () => {
    expect(DocPointer("name").pointerType).toBe("doc");
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

  it('returns false for a DocPointer', () => {
    expect(DocPointer("doc").isClip).toBeFalsy();
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

  it('returns object with typ "link type" and name prop when called on LinkTypePointer', () => {
    let leafData = LinkTypePointer("the name").leafData();

    expect(leafData).toEqual({ typ: "link type", name: "the name"});
  });

  it('returns object with typ "doc" and name prop when called on DocPointer', () => {
    let leafData = DocPointer("the name").leafData();

    expect(leafData).toEqual({ typ: "doc", name: "the name"});
  });
});

describe('restoring leafData', () => {
  test('leafDataToLinkPointer is inverse of leafData', () => {
    let link = LinkPointer("test name");

    expect(leafDataToLinkPointer(link.leafData())).toEqual(link);
  });

  test('leafDataToLinkTypePointer is inverse of leafData', () => {
    let link = LinkTypePointer("test name");

    expect(leafDataToLinkTypePointer(link.leafData())).toEqual(link);
  });

  test('leafDataToDockPointer is inverse of leafData', () => {
    let doc = DocPointer("test name");

    expect(leafDataToDocPointer(doc.leafData())).toEqual(doc);
  });

  test('leafDataToPointer is inverse of leafData for LinkPointer', () => {
    let link = LinkPointer("test name");

    expect(leafDataToPointer(link.leafData())).toEqual(link);
  });

  test('leafDataToPointer is inverse of leafData for LinkTypePointer', () => {
    let link = LinkTypePointer("test name");

    expect(leafDataToPointer(link.leafData())).toEqual(link);
  });

  test('leafDataToPointer is inverse of leafData for DocPointer', () => {
    let doc = DocPointer("test name");

    expect(leafDataToPointer(doc.leafData())).toEqual(doc);
  });
});
