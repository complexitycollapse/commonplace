import { describe, expect, it } from '@jest/globals';
import { DocumentModelBuilder, docModelBuilderTesting } from './document-model-builder';
import {
  Part, LinkPointer, Link, Span, Image, Edl, EdlPointer, InlinePointer
} from '@commonplace/core';
import {
  defaultsType, definesSequenceType, markupType, definesSemanticClassType, metatype,
  defaultsPointer
} from '../well-known-objects';
import { createTestCache } from '../Testing/docuverse-builder';

function getLink(links, name) {
  return links.get(LinkPointer(name).hashableName);
}

function sequenceMetalink({ name, end, type, clipsInSequence = [] } = {}) {
  let endSpecs = [];
  name = name ?? "metalink";

  if (end) endSpecs.push(["end", end]);
  if (type) endSpecs.push(["type", type]);
  let metalink = [
    name,
    Link(definesSequenceType, ...endSpecs)
  ];

  let link = ["target", Link(LinkPointer("type link"), ["foo", clipsInSequence])];
  let typeLink = ["type link", Link(InlinePointer("type"), [undefined, [LinkPointer(name)]])]

  return [link, typeLink, metalink];
}

function classMetalink({ name, ends = [], pointers = [] } = {}) {
  let metalinkEndSpecs = [], linkEndSpecs = [];
  name = name ?? "metalink";

  ends.forEach(end => {
    metalinkEndSpecs.push(["end", [InlinePointer(end)]]);
    linkEndSpecs.push([end, pointers]);
  });

  let metalink = [
    name,
    Link(definesSemanticClassType, ...metalinkEndSpecs)
  ];

  let link = ["target", Link(LinkPointer("type link"), ...linkEndSpecs)];
  let typeLink = ["type link", Link(metatype, [undefined, [LinkPointer(name)]])]

  return [link, typeLink, metalink];
}

function make(clips = [], links = [], edlPointer, additionalParts = []) {
  edlPointer = edlPointer ?? EdlPointer("doc");
  let parts = links.filter(x => x[1]).map(x => Part(LinkPointer(x[0]), x[1] === true ?  Link(x[0]) : x[1]))
    .concat(clips.filter(x => x[1]).map(x => x[0].pointerType === "edl" ? x.slice(2).map(y => Part(LinkPointer(y[0]), y[1])).concat(Part(x[0], x[1])) : []).flat())
    .concat([Part(edlPointer, Edl(InlinePointer("document"), clips.map(x => x[0]), links.map(x => LinkPointer(x[0]))))])
    .concat(additionalParts);
  let builder = docModelBuilderTesting.makeMockedBuilderFromParts(edlPointer, parts);
  let model = builder.build();
  return model;
}

describe('build', () => {
  describe('type', () => {
    it('should equal the type of the EDL', () => {
      let edl = Edl(InlinePointer("expected type"), [], []);
      let edlPointer = EdlPointer("testedl");
      expect(DocumentModelBuilder(
        edlPointer,
        createTestCache([Part(edlPointer, edl)])).build().type)
      .toEqual(InlinePointer("expected type"));
    });
  });

  describe('links', () => {
    it('returns an empty map of links when the doc has no links', () => {
      expect(make().links.size).toBe(0);
    });

    it('returns a link under its hashable name if it is present in the cache', () => {
      expect(getLink(make([], [["link1", true]]).links, "link1").type).toEqual("link1");
    });

    it('does not return a link under its hashable name if it is NOT present in the cache', () => {
      expect(getLink(make([], [["link1", false]]).links, "link1")).toBeFalsy();
    });

    it('sets isDefault on the link to false', () => {
      expect(getLink(make([], [["link1", true]]).links, "link1").isDefault).toBeFalsy();
    });

    it('returns links in an EDL AND its parent', () => {
      let link1 = Link(InlinePointer("link1")), link2 = Link(InlinePointer("link2"));
      let edl1 = Edl(undefined, [], [LinkPointer("link2")]);

      let zettel = make([[EdlPointer("edl1"), edl1, ["link2", link2]]], [["link1", link1]]).zettel;

      expect(zettel[0].links.size).toBe(2);
      expect(getLink(zettel[0].links, "link1").type).toEqual(InlinePointer("link1"));
      expect(getLink(zettel[0].links, "link2").type).toEqual(InlinePointer("link2"));
    });

    it('does not return links in a child EDL', () => {
      let link1 = Link(InlinePointer("link1")), link2 = Link(InlinePointer("link2"));
      let edl1 = Edl(undefined, [], [LinkPointer("link2")]);

      let links = make([[EdlPointer("edl1"), edl1, ["link2", link2]]], [["link1", link1]]).links;

      expect(links.size).toBe(1);
      expect(getLink(links, "link1").type).toEqual(InlinePointer("link1"));
      expect(links.has("links2")).toBeFalsy();
    });

    it('links in the EDL have depth 0 and those from the parent have depth 1', () => {
      let link1 = Link(InlinePointer("link1")), link2 = Link(InlinePointer("link2"));
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
      let link2 = Link(InlinePointer("link2"), [undefined, [LinkPointer("link1")]]);
      let links = make([], [["link1", true], ["link2", link2]]).links;

      let incoming = getLink(links, "link1").incomingPointers;
      expect(incoming).toHaveLength(1);
      expect(incoming[0].link).toMatchObject(link2);
      expect(incoming[0].pointer).toEqual(LinkPointer("link1"));
      expect(incoming[0].end).toMatchObject(link2.ends[0]);
    });

    it('interlinks all links in the scope of a child EDL', () => {
      let link1 = Link(InlinePointer("link1"), [undefined, [LinkPointer("link2")]]), link2 = Link(InlinePointer("link2"), [undefined, [LinkPointer("link1")]]);
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
      let link1 = Link(InlinePointer("link1"), [undefined, [LinkPointer("link2")]]), link2 = Link(InlinePointer("link2"), [undefined, [LinkPointer("link1")]]);
      let edl1 = Edl(undefined, [], [LinkPointer("link2")]);

      let links = make([[EdlPointer("edl1"), edl1, ["link2", link2]]], [["link1", link1]]).links;

      expect(getLink(links, "link1").incomingPointers).toHaveLength(0);
    });

    it('links to the EDL itself', () => {
      let link = Link(InlinePointer("link1"), [undefined, [EdlPointer("edl1")]]);

      let model = make([], [["link1", link]], EdlPointer("edl1"));

      expect(model.incomingPointers).toHaveLength(1);
      expect(model.incomingPointers[0].link).toMatchObject(link);
    });
  });

  describe('zettel', () => {
    it('returns an empty array if there are no clips in the doc', () => {
      expect(make().zettel).toEqual([]);
    });

    it('returns a zettel for each clip if there are no links that bisect them', () => {
      let clip1 = Span("x", 1, 10), clip2 = Image("y", 1, 1, 10, 20), clip3 = Span("z", 20, 200);

      expect(make([[clip1, true], [clip2, true], [clip3, true]]).zettel).toMatchObject([
        { pointer: clip1 },
        { pointer: clip2 },
        { pointer: clip3 },
      ]);
    });

    it('splits a clip into multiple zettel if the clip is bisected by a link', () => {
      let clip1 = Span("x", 1, 10);
      let link = Link(undefined, [undefined, [Span("x", 5, 10)]]);

      let zettel = make([[clip1, true]], [["link1", link]]).zettel;

      expect(zettel.length).toBe(2);
      expect(zettel[0].pointer).toEqual(Span("x", 1, 4));
      expect(zettel[1].pointer).toEqual(Span("x", 5, 6));
    });

    it('attaches link pointers to the zettel that they point to', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link(InlinePointer("link1"), [undefined, [Span("x", 1, 20)]]);
      let link2 = Link(InlinePointer("link2"), [undefined, [Span("x", 1, 30)]]);

      let zettel = make([[clip1, true]], [["link1", link1], ["link2", link2]]).zettel;

      expect(zettel[0].incomingPointers[0]).toMatchObject({ pointer: Span("x", 1, 20), end: link1.ends[0], link: link1});
      expect(zettel[0].incomingPointers[1]).toMatchObject({ pointer: Span("x", 1, 30), end: link2.ends[0], link: link2});
    });

    it('does not attach a link to a zettel if it does not point to it', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link(undefined, [undefined, [Span("somewhere else", 1, 20)]]);

      let zettel = make([[clip1, true]], [["link1", link1]]).zettel;

      expect(zettel[0].incomingPointers).toEqual([]);
    });

    describe('getContent', () => {
      it('returns the clipped content if it is available locally in the cache', () => {
        let clip = Span("test origin", 5, 6);
        let contentPart = Part(Span("test origin", 0, 15), "xxxxx123456xxxx");

        let zettel = make([[clip, true]], [], undefined, [contentPart]).zettel[0];

        expect(zettel.getContent()).toBe("123456");
      });

      it('returns undefined if the clipped content is not available locally in the cache', () => {
        let clip = Span("test origin", 5, 6);

        let zettel = make([[clip, true]], []).zettel[0];

        expect(zettel.getContent()).toBe(undefined);
      });
    });

    it('creates a nested structure for a nested EDL', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link(undefined, [undefined, [Span("x", 1, 20)]]);
      let edl1 = Edl(InlinePointer("nested EDL"), [clip1], [LinkPointer("link1")]);

      let zettel = make([[EdlPointer("edl1"), edl1]], [["link1", link1]]).zettel;

      expect(zettel).toHaveLength(1);
      let child = zettel[0];
      expect(child.type).toEqual(InlinePointer("nested EDL"));
      expect(child.zettel).toHaveLength(1);
      expect(child.zettel[0].pointer).toEqual(clip1);
      expect(child.links.size).toBe(1);
      expect(getLink(child.links, "link1")).toMatchObject(link1);
      expect(child.zettel[0].incomingPointers[0].link).toMatchObject(link1);
    });

    it('splits a clip in a child EDL into multiple zettel if the clip is bisected by a link in the parent', () => {
      let clip1 = Span("x", 1, 10);
      let link1 = Link(undefined, [undefined, [Span("x", 5, 10)]]);
      let edl1 = Edl(undefined, [clip1], []);

      let zettel = make([[EdlPointer("edl1"), edl1]], [["link1", link1]]).zettel;

      expect(zettel[0].zettel).toHaveLength(2);
      expect(zettel[0].zettel[0].pointer).toEqual(Span("x", 1, 4));
      expect(zettel[0].zettel[1].pointer).toEqual(Span("x", 5, 6));
    });
  });

  describe('Edls', () => {
    it('returns an EdlModel for each EDL', () => {
      let edl1 = Edl(undefined, [], []), edl2 = Edl(undefined, [], []), edl3 = Edl(undefined, [], []);

      expect(make([[EdlPointer("edl1"), edl1], [EdlPointer("edl2"), edl2], [EdlPointer("edl3"), edl3]]).zettel).toMatchObject([
        { pointer: EdlPointer("edl1") },
        { pointer: EdlPointer("edl2") },
        { pointer: EdlPointer("edl3") }
      ]);
    });

    it('attaches link pointers to the EDL that they point to', () => {
      let edl1 = Edl(undefined, [], []);
      let link1 = Link(InlinePointer("link1"), [undefined, [EdlPointer("edl1")]]);
      let link2 = Link(InlinePointer("link2"), [undefined, [EdlPointer("edl1")]]);

      let zettel = make([[EdlPointer("edl1"), edl1]], [["link1", link1], ["link2", link2]]).zettel;

      expect(zettel[0].incomingPointers[0]).toMatchObject({ pointer: EdlPointer("edl1"), end: link1.ends[0], link: link1});
      expect(zettel[0].incomingPointers[1]).toMatchObject({ pointer: EdlPointer("edl1"), end: link2.ends[0], link: link2});
    });

    it('does not attach a link to an EDL if it does not point to it', () => {
      let edl1 = Edl(undefined, [], []);
      let link1 = Link(InlinePointer("link1"), [undefined, [EdlPointer("different-edl")]]);

      let zettel = make([[EdlPointer("edl1"), edl1]], [["link1", link1]]).zettel;

      expect(zettel[0].incomingPointers).toEqual([]);
    });
  });

  describe('markupRules', () => {
    function markupLink({ name, attributeDescriptors = [], immediateTargets, linkTypes, clipTypes, edlTypes } = {}) {
      let endSpecs = attributeDescriptors.map(av => [
        ["attribute", [InlinePointer(av[0])]],
        ["value", [InlinePointer(av[1])]],
        ["inheritance", [InlinePointer(av[2])]]]
      ).flat();

      if (immediateTargets) endSpecs.push(["targets", immediateTargets]);
      if (linkTypes) endSpecs.push(["link types", linkTypes]);
      if (clipTypes) endSpecs.push(["clip types", clipTypes]);
      if (edlTypes) endSpecs.push(["edl types", edlTypes]);
      let link = [
        name ?? "markup link",
        Link(markupType, ...endSpecs)
      ];

      return link;
    }

    it('is empty if there are no markup links', () => {
      expect(make([], [["not a markup link", true]]).markupRules).toEqual([]);
    });

    it('returns a rule if there is a markup link', () => {
      expect(make([], [markupLink()]).markupRules).toHaveLength(1);
    });

    it('sets markupRule on the link to the rule', () => {
      let model = make([], [markupLink()]);

      expect([...model.links.values()][0].markupRule).toBeTruthy();
    });

    it('returns a rule for each markup link', () => {
      expect(make([], [markupLink({name: "markup1"}), markupLink({name: "markup2"}), markupLink({name: "markup3"})]).markupRules).toHaveLength(3);
    });

    it('sets all of the criteria properties to the content values of the link ends', () => {
      let link = markupLink({
        clipTypes: [InlinePointer("ct1"), InlinePointer("ct2")],
        linkTypes: [InlinePointer("lt1"), InlinePointer("lt2")],
        edlTypes: [InlinePointer("et1"), InlinePointer("et2")]
      });

      let rule = make([], [link]).markupRules[0];

      expect(rule.clipTypes).toEqual(["ct1", "ct2"]);
      expect(rule.linkTypes).toEqual([InlinePointer("lt1"), InlinePointer("lt2")]);
      expect(rule.edlTypes).toEqual([InlinePointer("et1"), InlinePointer("et2")]);
    });

    it('sets the attributeDescriptors on the rule from the link', () => {
      let attributeDescriptors = [["attr1", "val1", "direct"], ["attr2", "val2", "content"]];

      let actual = make([], [markupLink({attributeDescriptors})]).markupRules[0].attributeDescriptors;

      expect(actual[0].attribute).toEqual("attr1");
      expect(actual[0].value).toEqual("val1");
      expect(actual[0].inheritance).toEqual("direct");
      expect(actual[1].attribute).toEqual("attr2");
      expect(actual[1].value).toEqual("val2");
      expect(actual[1].inheritance).toEqual("content");
    });
  });

  describe('Sequence prototypes', () => {
    it('adds the meta-sequence prototype to the targeted end', () => {
      let links = sequenceMetalink({end: [InlinePointer("foo")]});

      let actualLink = getLink(make([], links).links, "target");

      expect(actualLink.getEnd("foo").sequencePrototypes).toHaveLength(1);
    });

    it('sets the type property on the prototype to be the type specified in the metalink', () => {
      let links = sequenceMetalink({end: [InlinePointer("foo")], type: [InlinePointer("expected")]});

      let actualLink = getLink(make([], links).links, "target");

      expect(actualLink.getEnd("foo").sequencePrototypes[0].type).toEqual("expected");
    });

    it('sets the type property on the prototype to be the type of the defining link if no type is specified in the metalink', () => {
      let links = sequenceMetalink({end: [InlinePointer("foo")]});

      let actualLink = getLink(make([], links).links, "target");

      expect(actualLink.getEnd("foo").sequencePrototypes[0].type).toEqual(links[1][1]);
    });

    it('sets the definingLink property on the prototype to be the link it comes from', () => {
      let links = sequenceMetalink({end: [InlinePointer("foo")], type: [InlinePointer("expected")]});

      let actualLink = getLink(make([], links).links, "target");

      expect(actualLink.getEnd("foo").sequencePrototypes[0].definingLink).toBe(actualLink);
    });

    it('sets the end property on the prototype to be the end that defines the sequence', () => {
      let links = sequenceMetalink({end: [InlinePointer("foo")], type: [InlinePointer("expected")]});

      let actualLink = getLink(make([], links).links, "target");

      expect(actualLink.getEnd("foo").sequencePrototypes[0].end).toBe(actualLink.getEnd("foo"));
    });

    it('sets the signature property on the prototype to an object with the pointers of the link and metalink', () => {
      let links = sequenceMetalink({name: "meta", end: [InlinePointer("foo")]});

      let actualLink = getLink(make([], links).links, "target");

      expect(actualLink.getEnd("foo").sequencePrototypes[0].signature).toMatchObject({
        metalinkPointer: LinkPointer("meta"),
        linkPointer: LinkPointer("target")
      });
    });
  });

  describe('Semantic class link', () => {
    it('adds the class to the targeted end', () => {
      let links = classMetalink({ends: ["foo"]});

      let actualLink = getLink(make([], links).links, "target");

      expect(actualLink.getEnd("foo").semanticClasses).toHaveLength(1);
    });

    it('sets the class endowed by the end to the type of the link', () => {
      let links = classMetalink({ends: ["foo"]});

      let actualLink = getLink(make([], links).links, "target");

      expect(actualLink.getEnd("foo").semanticClasses[0].link).toEqual(links[1][1]);
    });

    it('will endow a class to a zettel', () => {
      let span = Span("x", 1, 10);
      let links = classMetalink({ ends: ["foo"], pointers: [span] });

      let zettel = make([[span, true]], links).zettel[0];

      expect(zettel.getClasses().map(c => c.link)).toEqual([links[1][1]]);
    });

    it('will endow a class to a link', () => {
      let link = ["subject", Link()];
      let links = classMetalink({ ends: ["foo"], pointers: [LinkPointer("subject")] });

      let linkModel = getLink(make([], [...links, link]).links, "subject");

      expect(linkModel.getClasses().map(c => c.link)).toEqual([links[1][1]]);
    });

    it('will endow a class to an Edl', () => {
      let edl1 = Edl([], []);
      let links = classMetalink({ ends: ["foo"], pointers: [EdlPointer("edl1")] });

      let edlModel = make([[EdlPointer("edl1"), edl1, []]], links).zettel[0];

      expect(edlModel.getClasses().map(c => c.link)).toEqual([links[1][1]]);
    });
  });

  describe('defaultLinks', () => {
    it('is empty Map when there are no defaults', () => {
      expect(make().defaultsLinks.size).toBe(0);
    });

    it('returns all defaults links found in the cache', () => {
      let edl = Edl(InlinePointer("expected type"), [], []);
      let edlPointer = EdlPointer("testedl");
      let defaultsEdl = Edl(defaultsType, [], [LinkPointer("default1"), LinkPointer("default2")]);
      let defaultLink1 = Link(InlinePointer("d1")), defaultLink2 = Link(InlinePointer("d2"));
      let parts = [
        Part(edlPointer, edl),
        Part(defaultsPointer, defaultsEdl),
        Part(LinkPointer("default1"), defaultLink1),
        Part(LinkPointer("default2"), defaultLink2)
      ];

      let defaults = DocumentModelBuilder(edlPointer, createTestCache(parts)).build().defaultsLinks;

      expect(getLink(defaults, "default1")).toMatchObject(defaultLink1);
      expect(getLink(defaults, "default2")).toMatchObject(defaultLink2);
    });

    it('returns defaults with isDefault set to true', () => {
      let edl = Edl(InlinePointer("expected type"), [], []);
      let edlPointer = EdlPointer("testedl");
      let defaultsEdl = Edl(defaultsType, [], [LinkPointer("default1")]);
      let parts = [
        Part(edlPointer, edl),
        Part(defaultsPointer, defaultsEdl),
        Part(LinkPointer("default1"), Link(InlinePointer("d1"))),
      ];

      let defaults = DocumentModelBuilder(edlPointer, createTestCache(parts)).build().defaultsLinks;

      expect(getLink(defaults, "default1").isDefault).toBeTruthy();
    });

    it('will be interlinked to Edl links', () => {
      let edl = Edl(InlinePointer("expected type"), [], [LinkPointer("link1")]);
      let targetLink = Link(InlinePointer("target type")), defaultLink = Link(InlinePointer("d1"), [undefined, [LinkPointer("link1")]]);
      let edlPointer = EdlPointer("testedl");
      let defaultsEdl = Edl(defaultsType, [], [LinkPointer("default1")]);
      let parts = [
        Part(edlPointer, edl),
        Part(defaultsPointer, defaultsEdl),
        Part(LinkPointer("default1"), defaultLink),
        Part(LinkPointer("link1"), targetLink)
      ];

      let model = DocumentModelBuilder(edlPointer, createTestCache(parts)).build();

      expect(getLink(model.links, "link1").incomingPointers[0].link).toMatchObject(defaultLink);
    });
  });

  describe('key', () => {
    it('is set to 1 on the document', () => {
      expect(make().key).toBe("1");
    });

    it('is set to 1:0:0 on the first child span', () => {
      expect(make([[Span("x", 1, 10), true]]).zettel[0].key).toBe("1:0:0");
    });

    it('is set to 1:0 on the first child image', () => {
      expect(make([[Image("x", 1, 1, 10, 10), true]]).zettel[0].key).toBe("1:0");
    });

    it('is set to 1:0 on the first child EDL', () => {
      expect(make([[EdlPointer("edl1"), Edl(undefined, [], [])]]).zettel[0].key).toBe("1:0");
    });

    it('is set to 1:0 on the first child link', () => {
      expect(getLink(make([], [["link1", true]]).links, "link1").key).toEqual("1:0");
    });

    it('is set to unique values on different children', () => {
      let model = make(
        [[Span("x", 1, 10), true], [Image("x", 1, 1, 10, 10), true], [Span("x", 1, 10), true]],
        [["link1", true], ["link2", true]]);

      expect(getLink(model.links, "link1").key).toBe("1:0");
      expect(getLink(model.links, "link2").key).toBe("1:1");
      expect(model.zettel[0].key).toBe("1:2:0");
      expect(model.zettel[1].key).toBe("1:3");
      expect(model.zettel[2].key).toBe("1:4:0");
    });

    it('is set to unique values on zettel produced by a schneidered span', () => {
      let clip1 = Span("x", 1, 10);
      let link = Link(undefined, [undefined, [Span("x", 5, 10)]]);

      let zettel = make([[clip1, true]], [["link1", link]]).zettel;

      expect(zettel[0].key).toBe("1:1:0");
      expect(zettel[1].key).toBe("1:1:1");
    });

    it('is set to a subkey on children of a child EDL', () => {
      let clip1 = Span("x", 1, 10);
      let edl1 = Edl(InlinePointer("nested EDL"), [clip1], []);

      let zettel = make([[EdlPointer("edl1"), edl1]]).zettel;

      expect(zettel[0].zettel[0].key).toBe("1:0:0:0");
    });

    it('is an extension of the sequences defining link for a sequence', () => {
      let clip1 = Span("x", 1, 10);
      let links = sequenceMetalink({clipsInSequence: [clip1], end: [InlinePointer("foo")]});

      let sequence = make([[clip1, true]], links).rootSequences()[0];

      expect(sequence.key).toEqual(sequence.definingLink.key + "-0");
    });

    it('is unique for each instance of a sequence', () => {
      let clip1 = Span("x", 1, 10);
      let links = sequenceMetalink({clipsInSequence: [clip1], end: [InlinePointer("foo")]});

      let sequences = make([[clip1, true], [clip1, true], [clip1, true]], links).rootSequences();

      expect(sequences[0].key).toEqual(sequences[0].definingLink.key + "-0");
      expect(sequences[1].key).toEqual(sequences[1].definingLink.key + "-1");
      expect(sequences[2].key).toEqual(sequences[2].definingLink.key + "-2");
    });
  });
});
