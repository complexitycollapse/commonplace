import { describe, expect, it } from '@jest/globals';
import { DocumentModelBuilder } from './document-model-builder';
import { Doc, Part, LinkPointer, Link, Span, Box, Edl, EdlPointer, InlinePointer } from '@commonplace/core';

function mockRepo(parts) {
  return { 
    getPartLocally: pointer => {
      if (pointer.pointerType === "inline") {
        return Part(pointer, pointer.inlineText);
      } else {
        return parts.find(p => p.pointer.hashableName === pointer.hashableName);
      }
    }
  };
}

function getLink(links, name) {
  return links[LinkPointer(name).hashableName];
}

function make(clips = [], links = []) {
  let parts = links.filter(x => x[1]).map(x => Part(LinkPointer(x[0]), x[1] === true ?  Link(x[0]) : x[1]))
    .concat(clips.filter(x => x[1]).map(x => x[0].pointerType === "edl" ? x.slice(2).map(y => Part(LinkPointer(y[0]), y[1])).concat(Part(x[0], x[1])) : [Part(x[0], "x".repeat(x[0].length))]).flat())
    .concat([Part(EdlPointer("document"), Doc(clips.map(x => x[0]), links.map(x => LinkPointer(x[0]))))]);
  let repo = mockRepo(parts);
  let builder = DocumentModelBuilder(EdlPointer("document"), repo);
  let model = builder.build();
  return model;
}

describe('build', () => {
  describe('type', () => {
    it('should equal the type of the EDL', () => {
      let edl = Edl("expected type", [], []);
      let edlPointer = EdlPointer("testedl");
      expect(DocumentModelBuilder(edlPointer, mockRepo([Part(edlPointer, edl)])).build().type).toBe("expected type");
    });
  });

  describe('links', () => {
    it('returns an empty object of links when the doc has no links', () => {
      expect(make().links).toEqual({});
    });

    it('returns a link under its hashable name if it is present in the repo', () => {
      expect(getLink(make([], [["link1", true]]).links, "link1").type).toEqual("link1");
    });

    it('does not return a link under its hashable name if it is NOT present in the repo', () => {
      expect(getLink(make([], [["link1", false]]).links, "link1")).toBeFalsy();
    });

    it('returns links in an EDL AND its parent', () => {
      let link1 = Link("link1"), link2 = Link("link2");
      let edl1 = Edl(undefined, [], [LinkPointer("link2")]);

      let zettel = make([[EdlPointer("edl1"), edl1, ["link2", link2]]], [["link1", link1]]).zettel;

      expect(Object.values(zettel[0].links).length).toBe(2);
      expect(getLink(zettel[0].links, "link1").type).toBe("link1");
      expect(getLink(zettel[0].links, "link2").type).toBe("link2");
    });

    it('does not return links in a child EDL', () => {
      let link1 = Link("link1"), link2 = Link("link2");
      let edl1 = Edl(undefined, [], [LinkPointer("link2")]);

      let links = make([[EdlPointer("edl1"), edl1, ["link2", link2]]], [["link1", link1]]).links;

      expect(Object.values(links)).toHaveLength(1);
      expect(getLink(links, "link1").type).toBe("link1");
      expect(links).not.toHaveProperty("links2");
    });

    it('links in the EDL have depth 0 and those from the parent have depth 1', () => {
      let link1 = Link("link1"), link2 = Link("link2");
      let edl1 = Edl(undefined, [], [LinkPointer("link2")]);

      let zettel = make([[EdlPointer("edl1"), edl1, ["link2", link2]]], [["link1", link1]]).zettel;

      expect(getLink(zettel[0].links, "link1").depth).toBe(1);
      expect(getLink(zettel[0].links, "link2").depth).toBe(0);
    });

    it('links have an index equivalent to their order in the original EDL', () => {
      let links = make([], [["link1", true], ["link2", true]]).links;

      expect(getLink(links, "link1").index).toBe(0);
      expect(getLink(links, "link2").index).toBe(1);
    });

    it('interlinks links that point to each other through the incomingPointers property', () => {
      let link2 = Link("link2", [undefined, [LinkPointer("link1")]]);
      let links = make([], [["link1", true], ["link2", link2]]).links;

      let incoming = getLink(links, "link1").incomingPointers;
      expect(incoming).toHaveLength(1);
      expect(incoming[0].link).toMatchObject(link2);
      expect(incoming[0].pointer).toEqual(LinkPointer("link1"));
      expect(incoming[0].end).toEqual(link2.ends[0]);
    });

    it('interlinks all links in the scope of a child EDL', () => {
      let link1 = Link("link1", [undefined, [LinkPointer("link2")]]), link2 = Link("link2", [undefined, [LinkPointer("link1")]]);
      let edl1 = Edl(undefined, [], [LinkPointer("link2")]);

      let zettel = make([[EdlPointer("edl1"), edl1, ["link2", link2]]], [["link1", link1]]).zettel;

      let createdLink1 = getLink(zettel[0].links, "link1");
      expect(createdLink1.incomingPointers).toHaveLength(1);
      expect(createdLink1.incomingPointers[0].link).toMatchObject(link2);
      let createdLink2 = getLink(zettel[0].links, "link2");
      expect(createdLink2.incomingPointers).toHaveLength(1);
      expect(createdLink2.incomingPointers[0].link).toMatchObject(link1);
    });

    it('does not interlink child EDL links to links in the parent', () => {
      let link1 = Link("link1", [undefined, [LinkPointer("link2")]]), link2 = Link("link2", [undefined, [LinkPointer("link1")]]);
      let edl1 = Edl(undefined, [], [LinkPointer("link2")]);

      let links = make([[EdlPointer("edl1"), edl1, ["link2", link2]]], [["link1", link1]]).links;

      expect(getLink(links, "link1").incomingPointers).toHaveLength(0);
    });
  });

  describe('zettel', () => {
    it('returns an empty array if there are no clips in the doc', () => {
      expect(make().zettel).toEqual([]);
    });

    it('returns a zettel for each clip if there are no links that bisect them', () => {
      let clip1 = Span("x", 1, 10), clip2 = Box("y", 1, 1, 10, 20), clip3 = Span("z", 20, 200);

      expect(make([[clip1, true], [clip2, true], [clip3, true]]).zettel).toEqual([
        { clip: clip1, incomingPointers: []},
        { clip: clip2, incomingPointers: []},
        { clip: clip3, incomingPointers: []},
      ]);
    });

    it('splits a clip into multiple zettel if the clip is bisected by a link', () => {
      let clip1 = Span("x", 1, 10);
      let link = Link(undefined, [undefined, [Span("x", 5, 10)]]);

      let zettel = make([[clip1, true]], [["link1", link]]).zettel;

      expect(zettel.length).toBe(2);
      expect(zettel[0].clip).toEqual(Span("x", 1, 4));
      expect(zettel[1].clip).toEqual(Span("x", 5, 6));
    });

    it('attaches link pointers to the zettel that they point to', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link("link1", [undefined, [Span("x", 1, 20)]]);
      let link2 = Link("link2", [undefined, [Span("x", 1, 30)]]);

      let zettel = make([[clip1, true]], [["link1", link1], ["link2", link2]]).zettel;

      expect(zettel[0].incomingPointers[0]).toEqual({ pointer: Span("x", 1, 20), end: link1.ends[0], link: link1});
      expect(zettel[0].incomingPointers[1]).toEqual({ pointer: Span("x", 1, 30), end: link2.ends[0], link: link2});
    });

    it('does not attach a link to a zettel if it does not point to it', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link(undefined, [undefined, [Span("somewhere else", 1, 20)]]);

      let zettel = make([[clip1, true]], [["link1", link1]]).zettel;

      expect(zettel[0].incomingPointers).toEqual([]);
    });

    it('creates a nested structure for a nested EDL', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link(undefined, [undefined, [Span("x", 1, 20)]]);
      let edl1 = Edl("nested EDL", [clip1], [LinkPointer("link1")]);

      let zettel = make([[EdlPointer("edl1"), edl1]], [["link1", link1]]).zettel;

      expect(zettel).toHaveLength(1);
      let child = zettel[0];
      expect(child.type).toBe("nested EDL");
      expect(child.zettel).toHaveLength(1);
      expect(child.zettel[0].clip).toEqual(clip1);
      expect(Object.entries(child.links)).toHaveLength(1);
      expect(child.links[LinkPointer("link1").hashableName]).toMatchObject(link1);
      expect(child.zettel[0].incomingPointers[0].link).toEqual(link1);
    });

    it('splits a clip in a child EDL into multiple zettel if the clip is bisected by a link in the parent', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link(undefined, [undefined, [Span("x", 5, 10)]]);
      let edl1 = Edl(undefined, [clip1], []);

      let zettel = make([[EdlPointer("edl1"), edl1]], [["link1", link1]]).zettel;

      expect(zettel[0].zettel).toHaveLength(2);
      expect(zettel[0].zettel[0].clip).toEqual(Span("x", 1, 4));
      expect(zettel[0].zettel[1].clip).toEqual(Span("x", 5, 6));
    });
  });

  describe('markupRules', () => {
    function markupLink({ name, attributeValues = [], linkTypes, clipTypes, edlTypes } = {}) {
      let endSpecs = attributeValues.map(av => [["attribute",[InlinePointer(av[0])]], ["value", [InlinePointer(av[1])]]]).flat();
      if (linkTypes) endSpecs.push(["link types", linkTypes]);
      if (clipTypes) endSpecs.push(["clip types", clipTypes]);
      if (edlTypes) endSpecs.push(["edl types", edlTypes]);
      let link = [
        name ?? "markup",
        Link("markup", ...endSpecs)
      ];
      
      return link;
    }

    it('is empty if there are no markup links', () => {
      expect(make([], [["not a markup link", true]]).markupRules).toEqual([]);
    });

    it('returns a rule if there is a markup link', () => {
      expect(make([], [markupLink()]).markupRules).toHaveLength(1);
    });

    it('returns a rule for each markup link', () => {
      expect(make([], [markupLink({name: "markup1"}), markupLink({name: "markup"}), markupLink({name: "markup3"})]).markupRules).toHaveLength(3);
    });

    it('sets all of the criteria properties to the content values of the link ends', () => {
      let link = markupLink({
        clipTypes: [InlinePointer("ct1"), InlinePointer("ct2")],
        linkTypes: [InlinePointer("lt1"), InlinePointer("lt2")],
        edlTypes: [InlinePointer("et1"), InlinePointer("et2")]
      });

      let rule = make([], [link]).markupRules[0];

      expect(rule.clipTypes).toEqual(["ct1", "ct2"]);
      expect(rule.linkTypes).toEqual(["lt1", "lt2"]);
      expect(rule.edlTypes).toEqual(["et1", "et2"]);
    });

    it('sets the attributeValuePairs on the rule from the link', () => {
      let attributeValues = [["attr1", "val1"], ["attr2", "val2"]];

      let actual = make([], [markupLink({attributeValues})]).markupRules[0].attributeValuePairs;

      expect(actual[0].attribute).toEqual("attr1");
      expect(actual[0].value).toEqual("val1");
      expect(actual[1].attribute).toEqual("attr2");
      expect(actual[1].value).toEqual("val2");
    });
  });
});

