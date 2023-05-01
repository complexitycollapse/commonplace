import { describe, it, expect } from '@jest/globals';
import { DocuverseBuilder } from './docuverse-builder';
import { LinkPointer, Link, EdlPointer, Edl, Span } from '@commonplace/core';

describe('DocuverseBuilder', () => {
  describe('add', () => {
    it('adds a binding to the docuverse', () => {
      let dv = DocuverseBuilder().add(obj => ({
        x: { build: () => ({ foo: 100 }), resolvePointer: () => undefined }
      })).build();

      expect(dv.x.foo).toBe(100);
    });

    it('creates builder proxies for bindings that do not exist yet', () => {
      let dv = DocuverseBuilder().add(obj => ({
        y: obj.x,
        x: { build: () => ({ foo: 100 }), resolvePointer: () => undefined }
      })).build();

      expect(dv.y.foo).toBe(100);
    });

    it('creates a span with the given name', () => {
      let dv = DocuverseBuilder().add(obj => ({
        x: obj.aSpan()
      })).build();

      expect(dv.x.origin).toBe("x");
    });

    it('creates a link with the given name', () => {
      let dv = DocuverseBuilder().add(obj => ({
        x: obj.aLink().withEnd([undefined, [obj.y]]),
        y: obj.aSpan()
      })).build();

      expect(dv.x.ends).toHaveLength(1);
    });

    it('creates an Edl with links', () => {
      let dv = DocuverseBuilder().add(obj => ({
        x: obj.aLink().withEnd([undefined, [obj.edl]]),
        edl: obj.anEdl().withLink(obj.x)
      })).build();

      expect(dv.edl.links).toHaveLength(1);
    });

    it('creates a DocumentModelBuilder', () => {
      let dv = DocuverseBuilder().add(obj => ({
        edl: obj.anEdl(),
        dmb: obj.aDocModelBuilder(obj.edl)
      })).build();

      let model = dv.dmb.build();

      expect(model.pointer).toEqual(EdlPointer("edl"));
    });

    it('creates a mock cache', () => {
      let dv = DocuverseBuilder().build();

      expect(dv.cache).toBeTruthy();
    });

    it('populates the mock cache with the contents of the docuverse', async () => {
      let dv = DocuverseBuilder().add(obj => ({
        x: obj.aLink(),
        y: obj.anEdl(),
        z: obj.aSpan(Span("foo", 5, 20))
      })).build();

      let linkPart = await dv.cache.getPartLocally(LinkPointer("x"));
      let edlPart = await dv.cache.getPartLocally(EdlPointer("y"));
      let spanPart = await dv.cache.getPartLocally(Span("foo", 5, 20));

      expect(linkPart.pointer).toEqual(LinkPointer("x"));
      expect(linkPart.content).toEqual(Link());
      expect(edlPart.pointer).toEqual(EdlPointer("y"));
      expect(edlPart.content).toEqual(Edl());
      expect(spanPart.pointer).toEqual(Span("foo", 5, 20));
      expect(spanPart.content).toEqual("##########");
    });

    it('creates a mock repo', () => {
      let dv = DocuverseBuilder().build();

      expect(dv.repo).toBeTruthy();
    });

    it('populates the mock repo with the contents of the docuverse', async () => {
      let dv = DocuverseBuilder().add(obj => ({
        x: obj.aLink(),
        y: obj.anEdl(),
        z: obj.aSpan(Span("foo", 5, 20))
      })).build();

      let linkPart = await dv.repo.getPartLocally(LinkPointer("x"));
      let edlPart = await dv.repo.getPartLocally(EdlPointer("y"));
      let spanPart = await dv.repo.getPartLocally(Span("foo", 5, 20));

      expect(linkPart.pointer).toEqual(LinkPointer("x"));
      expect(linkPart.content).toEqual(Link());
      expect(edlPart.pointer).toEqual(EdlPointer("y"));
      expect(edlPart.content).toEqual(Edl());
      expect(spanPart.pointer).toEqual(Span("foo", 5, 20));
      expect(spanPart.content).toEqual("##########");
    });
  });
});
