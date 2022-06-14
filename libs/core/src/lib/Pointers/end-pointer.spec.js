import { describe, it, expect, test } from '@jest/globals';
import { EndsetPointer, leafDataToEndsetPointer } from './end-pointer';
import { LinkPointer } from './link-pointer';

test('pointerType equals "end"', () => {
  expect(EndsetPointer("name").pointerType).toBe("end");
});

test('isClip returns false', () => {
  expect(EndsetPointer("link").isClip).toBeFalsy();
});

describe('hashableName', () => {
  it('returns end and the link name suffixed with :N::N if there nothing else specified', () => {
    expect(EndsetPointer("xyz").hashableName).toBe("end:xyz:N::N");
  });

  it('returns end and the link name suffixed with the link index and ::N if there is a link index specified', () => {
    expect(EndsetPointer("xyz", 123).hashableName).toBe("end:xyz:123::N");
  });

  it('returns end and the link name, link index and end name suffixed by :N they are all specified', () => {
    expect(EndsetPointer("xyz", 123, "foo").hashableName).toBe("end:xyz:123:foo:N");
  });

  it('returns end and the link name, link index, end name and end index if they are all specified', () => {
    expect(EndsetPointer("xyz", 123, "foo", 100).hashableName).toBe("end:xyz:123:foo:100");
  });
});

describe('engulfs', () => {
  it('returns false if the other pointer is not an end pointer', () => {
    expect(EndsetPointer("name").engulfs(LinkPointer("name"))).toBeFalsy();
  });

  it('returns false if the other pointer has a different link name', () => {
    expect(EndsetPointer("name").engulfs(EndsetPointer("name2"))).toBeFalsy();
  });

  it('returns false if the other pointer has an index but we dont', () => {
    expect(EndsetPointer("name").engulfs(EndsetPointer("name", 0))).toBeFalsy();
  });

  it('returns false if we have an index but the other does not', () => {
    expect(EndsetPointer("name", 0).engulfs(EndsetPointer("name"))).toBeFalsy();
  });

  it('returns false if they both have indexes but they are different', () => {
    expect(EndsetPointer("name", 1).engulfs(EndsetPointer("name", 2))).toBeFalsy();
  });

  it('returns true if they have the same name and index', () => {
    expect(EndsetPointer("name", 1).engulfs(EndsetPointer("name", 1))).toBeTruthy();
  });

  it('returns true if they have the same name and neither has an index', () => {
    expect(EndsetPointer("name").engulfs(EndsetPointer("name"))).toBeTruthy();
  });

  it('returns false if they have different endName properties', () => {
    expect(EndsetPointer("name", undefined, "foo").engulfs(EndsetPointer("name"))).toBeFalsy();
  });

  it('returns true if they have the same endName properties', () => {
    expect(EndsetPointer("name", undefined, "foo").engulfs(EndsetPointer("name", undefined, "foo"))).toBeTruthy();
  });

  it('returns false if they have different endIndex properties', () => {
    expect(EndsetPointer("name", undefined, "foo", 123).engulfs(EndsetPointer("name", undefined, "foo", 234))).toBeFalsy();
  });
});

describe('leafDataToLinkPointer', () => {
  it('is the inverse of leafData when end details are fully specified', () => {
    let pointer = EndsetPointer("test link name", 123, "the end name", 21);

    expect(leafDataToEndsetPointer(pointer.leafData())).toEqual(pointer);
  });
});

describe('leafData', () => {
  it('returns object with typ "end" and name prop when called on EndsetPointer', () => {
    let leafData = EndsetPointer("link name").leafData();

    expect(leafData).toEqual({ typ: "end", lnk: "link name"});
  });

  it('returns object with typ "link" and name and index props when called on EndsetPointer with index', () => {
    let leafData = EndsetPointer("link name", 123).leafData();

    expect(leafData).toEqual({ typ: "end", lnk: "link name", lx: 123 });
  });

  it('returns object with typ "end", name, index and endName props when called on EndsetPointer with those properties', () => {
    let leafData = EndsetPointer("link name", 123, "end name").leafData();

    expect(leafData).toEqual({ typ: "end", lnk: "link name", lx: 123, end: "end name" });
  });

  it('returns object with typ "end", name, index and endIndex props when called on EndsetPointer with those properties', () => {
    let leafData = EndsetPointer("link name", 123, undefined, 100).leafData();

    expect(leafData).toEqual({ typ: "end", lnk: "link name", lx: 123, ex: 100 });
  });

  it('returns object with typ "end", name, index, endName and endIndex props when called on EndsetPointer with those properties', () => {
    let leafData = EndsetPointer("link name", 123, "end name", 100).leafData();

    expect(leafData).toEqual({ typ: "end", lnk: "link name", lx: 123, end: "end name", ex: 100 });
  });
});
