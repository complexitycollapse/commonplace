import { describe, it, expect, test } from '@jest/globals';
import { EdlPointer, leafDataToEdlPointer } from './edl-pointer';
import { LinkPointer, leafDataToLinkPointer } from './link-pointer';
import { leafDataToPointer } from './leaf-data-to-pointer';
import { Span } from './span';
import { Box } from './box';
import { InlinePointer } from './inline-pointer';

describe('pointerType', () => {
  it('equals "link" for LinkPointer', () => {
    expect(LinkPointer("name").pointerType).toBe("link");
  });

  it('equals "edl" for EdlPointer', () => {
    expect(EdlPointer("name").pointerType).toBe("edl");
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

  it('returns false for a EdlPointer', () => {
    expect(EdlPointer("edl").isClip).toBeFalsy();
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

  it('returns object with typ "edl" and name prop when called on EdlPointer', () => {
    let leafData = EdlPointer("the name").leafData();

    expect(leafData).toEqual({ typ: "edl", name: "the name"});
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

  test('leafDataToEdlPointer is inverse of leafData', () => {
    let edl = EdlPointer("test name");

    expect(leafDataToEdlPointer(edl.leafData())).toEqual(edl);
  });

  test('leafDataToPointer is inverse of leafData for LinkPointer', () => {
    let link = LinkPointer("test name");

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
});
