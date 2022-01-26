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
  it('returns link and the link name suffixed with :N if there is no index specified', () => {
    expect(LinkPointer("xyz").hashableName).toBe("link:xyz:N");
  });

  it('returns link and the link name suffixed with the index if there is an index specified', () => {
    expect(LinkPointer("xyz", 123).hashableName).toBe("link:xyz:123");
  });
});

describe('engulfs', () => {
  describe('LinkPointer', () => {
    it('returns false if the other pointer is not a link pointer', () => {
      expect(LinkPointer("name").engulfs(EdlPointer("name"))).toBeFalsy();
    });

    it('returns false if the other pointer has a different link name', () => {
      expect(LinkPointer("name").engulfs(LinkPointer("name2"))).toBeFalsy();
    });

    it('returns true if the other pointer has an index but we dont', () => {
      // in this case we represent the entire array of links and hence engulf
      // the individual link pointer
      expect(LinkPointer("name").engulfs(LinkPointer("name", 0))).toBeTruthy();
    });

    it('returns false if we have an index but the other does not', () => {
      expect(LinkPointer("name", 0).engulfs(LinkPointer("name"))).toBeFalsy();
    });

    it('returns false if they both have indexes but they are different', () => {
      expect(LinkPointer("name", 1).engulfs(LinkPointer("name", 2))).toBeFalsy();
    });

    it('returns true if they have the same name and index', () => {
      expect(LinkPointer("name", 1).engulfs(LinkPointer("name", 1))).toBeTruthy();
    });

    it('returns true if they have the same name and neither has an index', () => {
      expect(LinkPointer("name").engulfs(LinkPointer("name"))).toBeTruthy();
    });
  });

  describe('EdlPointer', () => {
    it('returns false if the other pointer is not an Edl pointer', () => {
      expect(EdlPointer("name").engulfs(LinkPointer("name"))).toBeFalsy();
    });

    it('returns false if the other pointer has a different Edl name', () => {
      expect(EdlPointer("name").engulfs(EdlPointer("name2"))).toBeFalsy();
    });

    it('returns true if the other pointer has an index but we dont', () => {
      // in this case we represent the entire array of links and hence engulf
      // the individual link pointer
      expect(EdlPointer("name").engulfs(EdlPointer("name", 0))).toBeTruthy();
    });

    it('returns false if we have an index but the other does not', () => {
      expect(EdlPointer("name", 0).engulfs(EdlPointer("name"))).toBeFalsy();
    });

    it('returns false if they both have indexes but they are different', () => {
      expect(EdlPointer("name", 1).engulfs(EdlPointer("name", 2))).toBeFalsy();
    });

    it('returns true if they have the same name and index', () => {
      expect(EdlPointer("name", 1).engulfs(EdlPointer("name", 1))).toBeTruthy();
    });

    it('returns true if they have the same name and neither has an index', () => {
      expect(EdlPointer("name").engulfs(EdlPointer("name"))).toBeTruthy();
    });
  });

  describe('EdlTypePointer', () => {
    it('returns false if the other pointer is not an EdlTypePointer', () => {
      expect(EdlTypePointer("name").engulfs(LinkPointer("name"))).toBeFalsy();
    });

    it('returns false if the other pointer has a different type name', () => {
      expect(EdlTypePointer("name").engulfs(EdlTypePointer("name2"))).toBeFalsy();
    });

    it('returns true if they have the same name', () => {
      expect(EdlTypePointer("name").engulfs(EdlTypePointer("name"))).toBeTruthy();
    });
  });

  describe('LinkTypePointer', () => {
    it('returns false if the other pointer is not an LinkTypePointer', () => {
      expect(LinkTypePointer("name").engulfs(LinkPointer("name"))).toBeFalsy();
    });

    it('returns false if the other pointer has a different type name', () => {
      expect(LinkTypePointer("name").engulfs(LinkTypePointer("name2"))).toBeFalsy();
    });

    it('returns true if they have the same name', () => {
      expect(LinkTypePointer("name").engulfs(LinkTypePointer("name"))).toBeTruthy();
    });
  });
});
