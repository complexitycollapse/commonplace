import { describe, expect, it } from '@jest/globals';
import { DocumentModelBuilder } from './document-model-builder';
import { Doc, Part, LinkPointer, Link, Span, Box, Edl, EdlPointer } from '@commonplace/core';

function mockRepo(parts) {
  return { getPartLocally: pointer => parts.find(p => p.pointer.hashableName === pointer.hashableName) };
}

function make(clips = [], links = []) {
  let parts = links.filter(x => x[1]).map(x => Part(LinkPointer(x[0]), x[2] ? x[2] :Link(x[0])))
    .concat(clips.filter(x => x[1]).map(x => Part(x[0], x[0].pointerType === "edl" ? x[1] : "x".repeat(x[0].length))));
  let repo = mockRepo(parts);
  let builder = DocumentModelBuilder(Doc(clips.map(x => x[0]), links.map(x => LinkPointer(x[0]))), repo);
  let model = builder.build();
  return model;
}

describe('build', () => {
  describe('type', () => {
    it('should equal the type of the EDL', () => {
      expect(DocumentModelBuilder(Edl("expected type", [], []), mockRepo([])).build().type).toBe("expected type");
    });
  });

  describe('links', () => {
    it('returns an empty object of links when the doc has no links', () => {
      expect(make().links).toEqual({});
    });

    it('returns a link under its hashable name if it is present in the repo', () => {
      expect(make([], [["link1", true]]).links[LinkPointer("link1").hashableName].type).toEqual("link1");
    });

    it('does not return a link under its hashable name if it is NOT present in the repo', () => {
      expect(make([], [["link1", false]]).links[LinkPointer("link1").hashableName]).toBeFalsy();
    });
  });

  describe('zettel', () => {
    it('returns an empty array if there are no clips in the doc', () => {
      expect(make().zettel).toEqual([]);
    });

    it('returns a zettel for each clip if there are no links that bisect them', () => {
      let clip1 = Span("x", 1, 10), clip2 = Box("y", 1, 1, 10, 20), clip3 = Span("z", 20, 200);

      expect(make([[clip1, true], [clip2, true], [clip3, true]]).zettel).toEqual([
        { clip: clip1, linkPointers: []},
        { clip: clip2, linkPointers: []},
        { clip: clip3, linkPointers: []},
      ]);
    });

    it('splits a clip into multiple zettel if the clip is bisected by a link', () => {
      let clip1 = Span("x", 1, 10);
      let link = Link(undefined, [undefined, [Span("x", 5, 10)]]);

      let zettel = make([[clip1, true]], [["link1", true, link]]).zettel;

      expect(zettel.length).toBe(2);
      expect(zettel[0].clip).toEqual(Span("x", 1, 4));
      expect(zettel[1].clip).toEqual(Span("x", 5, 6));
    });

    it('attaches link pointers to the zettel that they point to', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link("link1", [undefined, [Span("x", 1, 20)]]);
      let link2 = Link("link2", [undefined, [Span("x", 1, 30)]]);

      let zettel = make([[clip1, true]], [["link1", true, link1], ["link2", true, link2]]).zettel;

      expect(zettel[0].linkPointers[0]).toEqual({ clip: Span("x", 1, 20), end: link1.ends[0], link: link1});
      expect(zettel[0].linkPointers[1]).toEqual({ clip: Span("x", 1, 30), end: link2.ends[0], link: link2});
    });

    it('does not attach a link to a zettel if it does not point to it', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link(undefined, [undefined, [Span("somewhere else", 1, 20)]]);

      let zettel = make([[clip1, true]], [["link1", true, link1]]).zettel;

      expect(zettel[0].linkPointers).toEqual([]);
    });

    it('creates a nested structure for a nested EDL', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link(undefined, [undefined, [Span("x", 1, 20)]]);
      let edl1 = Edl("nested EDL", [clip1], [LinkPointer("link1")]);

      let zettel = make([[EdlPointer("edl1"), edl1]], [["link1", true, link1]]).zettel;

      expect(zettel.length).toBe(1);
      let child = zettel[0];
      expect(child.type).toBe("nested EDL");
      expect(child.zettel.length).toBe(1);
      expect(child.zettel[0].clip).toEqual(clip1);
      expect(Object.entries(child.links).length).toBe(1);
      expect(child.links[LinkPointer("link1").hashableName]).toEqual(link1);
      expect(child.zettel[0].linkPointers[0].link).toEqual(link1);
    });

    it('splits a clip in a child EDL into multiple zettel if the clip is bisected by a link in the parent', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link(undefined, [undefined, [Span("x", 5, 10)]]);
      let edl1 = Edl(undefined, [clip1], []);

      let zettel = make([[EdlPointer("edl1"), edl1]], [["link1", true, link1]]).zettel;

      expect(zettel[0].zettel.length).toBe(2);
      expect(zettel[0].zettel[0].clip).toEqual(Span("x", 1, 4));
      expect(zettel[0].zettel[1].clip).toEqual(Span("x", 5, 6));
    });
  });
});
