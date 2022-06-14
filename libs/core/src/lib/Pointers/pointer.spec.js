import { describe, it, expect, test } from '@jest/globals';
import { EdlPointer, leafDataToEdlPointer } from './edl-pointer';
import { LinkPointer, leafDataToLinkPointer } from './link-pointer';
import { LinkTypePointer, leafDataToLinkTypePointer } from './type-pointer';
import { EdlTypePointer, leafDataToEdlTypePointer } from './type-pointer';
import { PointerTypePointer } from './type-pointer';
import { leafDataToPointer } from './leaf-data-to-pointer';
import { Span } from './span';
import { Box } from './box';
import { EndsetPointer } from './end-pointer';
import { InlinePointer } from './inline-pointer';
import { Edl, Link } from '../model';

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

  it('equals "inline" for InlinePointer', () => {
    expect(InlinePointer("text").pointerType).toBe("inline");
  });

  it('equals "span" for Span', () => {
    expect(Span("or", 1, 2).pointerType).toBe("span");
  });

  it('equals "box" for Box', () => {
    expect(Box("or", 1, 2, 3, 4).pointerType).toBe("box");
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

  it('returns false for an InlinePointer', () => {
    expect(InlinePointer("txt").isClip).toBeFalsy();
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

  it('returns object with typ "edl" and name prop when called on EdlPointer', () => {
    let leafData = EdlPointer("the name").leafData();

    expect(leafData).toEqual({ typ: "edl", name: "the name"});
  });

  it('returns object with typ "edl type" and name prop when called on EdlTypePointer', () => {
    let leafData = EdlTypePointer("the name").leafData();

    expect(leafData).toEqual({ typ: "edl type", name: "the name"});
  });

  it('returns object with typ "inline" and txt prop when called on InlinePointer', () => {
    let leafData = InlinePointer("some text").leafData();

    expect(leafData).toEqual({ typ: "inline", txt: "some text"});
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

  test('leafDataToPointer is inverse of leafData for EndsetPointer', () => {
    let pointer = EndsetPointer("link name", 123, "end name", 100);

    expect(leafDataToPointer(pointer.leafData())).toEqual(pointer);
  });

  test('leafDataToPointer is inverse of leafData for PointerTypePointer', () => {
    let pointer = PointerTypePointer("span");

    expect(leafDataToPointer(pointer.leafData())).toEqual(pointer);
  });

  test('leafDataToPointer is inverse of leafData for LinkTypePointer', () => {
    let link = LinkTypePointer("test name");

    expect(leafDataToPointer(link.leafData())).toEqual(link);
  });

  test('leafDataToPointer is inverse of leafData for EdlPointer', () => {
    let edl = EdlPointer("test name");

    expect(leafDataToPointer(edl.leafData())).toEqual(edl);
  });

  test('leafDataToPointer is inverse of leafData for InlinePointer', () => {
    let inline = InlinePointer("inline text");

    expect(leafDataToPointer(inline.leafData())).toEqual(inline);
  });
});

describe('LinkPointer.hashableName', () => {
  it('returns link and the link name', () => {
    expect(LinkPointer("xyz").hashableName).toBe("link:xyz");
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

    it('returns true if they have the same name', () => {
      expect(LinkPointer("name").engulfs(LinkPointer("name"))).toBeTruthy();
    });

    describe('called on EndsetPointer', () => {
      it('returns false if the other pointer has a different link name', () => {
        expect(LinkPointer("name").engulfs(EndsetPointer("name2", undefined, "end name", 100))).toBeFalsy();
      });
  
      it('returns true if they have the same name', () => {
        expect(LinkPointer("name").engulfs(EndsetPointer("name", undefined, "end name", 100))).toBeTruthy();
      });
    });
  });

  describe('EdlPointer', () => {
    it('returns false if the other pointer is not an Edl pointer', () => {
      expect(EdlPointer("name").engulfs(LinkPointer("name"))).toBeFalsy();
    });

    it('returns false if the other pointer has a different Edl name', () => {
      expect(EdlPointer("name").engulfs(EdlPointer("name2"))).toBeFalsy();
    });

    it('returns true if they have the same name', () => {
      expect(EdlPointer("name").engulfs(EdlPointer("name"))).toBeTruthy();
    });
  });
});

describe('endowsTo', () => {
  describe('LinkPointer', () => {
    it('returns false if the other pointer is not a link pointer', () => {
      expect(LinkPointer("name").endowsTo(EdlPointer("name"))).toBeFalsy();
    });

    it('returns false if the other pointer has a different link name', () => {
      expect(LinkPointer("name").endowsTo(LinkPointer("name2"))).toBeFalsy();
    });

    it('returns true if they have the same name', () => {
      expect(LinkPointer("name").endowsTo(LinkPointer("name"))).toBeTruthy();
    });

    describe('called on EndsetPointer', () => {
      it('returns false if the other pointer has a different link name', () => {
        expect(LinkPointer("name").endowsTo(EndsetPointer("name2", undefined, "end name", 100))).toBeFalsy();
      });
  
      it('returns true if they have the same name', () => {
        expect(LinkPointer("name").endowsTo(EndsetPointer("name", undefined, "end name", 100))).toBeTruthy();
      });
    });
  });

  describe('EdlPointer', () => {
    it('returns false if the other pointer is not an Edl pointer', () => {
      expect(EdlPointer("name").endowsTo(LinkPointer("name"))).toBeFalsy();
    });

    it('returns false if the other pointer has a different Edl name', () => {
      expect(EdlPointer("name").endowsTo(EdlPointer("name2"))).toBeFalsy();
    });

    it('returns true if they have the same name', () => {
      expect(EdlPointer("name").endowsTo(EdlPointer("name"))).toBeTruthy();
    });
  });

  describe('EdlTypePointer', () => {
    it('returns false if the other pointer is not an EdlPointer', () => {
      expect(EdlTypePointer("test type").endowsTo(LinkPointer("test type"), Edl("test type"))).toBeFalsy();
    });

    it('returns false if the edl does not have the given type', () => {
      expect(EdlTypePointer("test type").endowsTo(EdlPointer("name"), Edl("test type 2"))).toBeFalsy();
    });

    it('returns true if the pointer is a edl pointer and the edl has the given type', () => {
      expect(EdlTypePointer("test type").endowsTo(EdlPointer("name"), Edl("test type"))).toBeTruthy();
    });
  });

  describe('LinkTypePointer', () => {
    it('returns false if the other pointer is not an LinkPointer', () => {
      expect(LinkTypePointer("test type").endowsTo(EdlPointer("test type"), Link("test type"))).toBeFalsy();
    });

    it('returns false if the link does not have the given type', () => {
      expect(LinkTypePointer("test type").endowsTo(LinkPointer("name"), Link("test type 2"))).toBeFalsy();
    });

    it('returns true if the pointer is a link pointer and the link has the given type', () => {
      expect(LinkTypePointer("test type").endowsTo(LinkPointer("name"), Link("test type"))).toBeTruthy();
    });
  });
});
