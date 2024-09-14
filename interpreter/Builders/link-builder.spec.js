import { describe, it, expect } from 'vitest';
import LinkBuilder from './link-builder';
import { Link, LinkPointer } from '@commonplace/core';

describe("LinkBuilder", () => {
  describe("outstanding", () => {
    it("requests the link when the pointer is set", () => {
      const builder = LinkBuilder({ pointer: LinkPointer("foo")});

      expect(builder.outstanding).toEqual([LinkPointer("foo")]);
    });

    it("stops requesting the link once it has been resolved", () => {
      const builder = LinkBuilder({ pointer: LinkPointer("foo")});

      builder.resolve([ { pointer: LinkPointer("foo"), object: Link() }]);

      expect(builder.outstanding).toEqual([]);
    });

    it("requests resolution of the type once the link has been resolved", () => {
      const builder = LinkBuilder({ pointer: LinkPointer("foo")});

      builder.resolve([ { pointer: LinkPointer("foo"), object: Link(LinkPointer("link type")) }]);

      expect(builder.outstanding).toEqual([LinkPointer("link type")]);
    });

    it("stops requesting the type once it as been resolved", () => {
      const builder = LinkBuilder({ pointer: LinkPointer("foo")});

      builder.resolve([ { pointer: LinkPointer("foo"), object: Link(LinkPointer("link type")) }]);
      builder.resolve([ { pointer: LinkPointer("link type"), object: Link(LinkPointer("type"))}]);

      expect(builder.outstanding).toEqual([]);
    });
  });
});
