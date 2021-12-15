import { describe, it, expect, test } from '@jest/globals';
import { LinkPointer, DocPointer, leafDataToLinkPointer, leafDataToDocPointer } from './pointer';
import { leafDataToPointer } from './leaf-data-to-pointer';
import { Span } from './span';
import { Box } from './box';

describe('pointerType', () => {
  it('equals "link" for LinkPointer', () => {
    expect(LinkPointer("name").pointerType).toBe("link");
  });

  it('equals "doc" for DocPointer', () => {
    expect(DocPointer("name").pointerType).toBe("doc");
  });

  it('equals "edit" for Span', () => {
    expect(Span("or", 1, 2).pointerType).toBe("edit");
  });

  it('equals "edit" for Box', () => {
    expect(Box("or", 1, 2, 3, 4).pointerType).toBe("edit");
  });
});

describe('isEdit', () => {
  it('returns false for a LinkPointer', () => {
    expect(LinkPointer("link").isEdit).toBeFalsy();
  });

  it('returns false for a DocPointer', () => {
    expect(DocPointer("doc").isEdit).toBeFalsy();
  });

  it('returns true for a Span', () => {
    expect(Span("ori", 10, 20).isEdit).toBeTruthy();
  });

  it('returns true for a Box', () => {
    expect(Box("ori", 1, 2, 3, 4).isEdit).toBeTruthy();
  });
});

describe('leafData', () => {
  it('returns object with typ "link" and name prop when called on LinkPointer', () => {
    let leafData = LinkPointer("the name").leafData();

    expect(leafData).toEqual({ typ: "link", name: "the name"});
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

  test('leafDataToDockPointer is inverse of leafData', () => {
    let doc = DocPointer("test name");

    expect(leafDataToDocPointer(doc.leafData())).toEqual(doc);
  });

  test('leafDataToPointer is inverse of leafData', () => {
    let link = LinkPointer("test name");

    expect(leafDataToPointer(link.leafData())).toEqual(link);
  });

  test('leafDataToPointer is inverse of leafData', () => {
    let doc = DocPointer("test name");

    expect(leafDataToPointer(doc.leafData())).toEqual(doc);
  });
});
