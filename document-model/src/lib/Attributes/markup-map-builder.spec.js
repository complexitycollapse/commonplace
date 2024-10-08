import { describe, it, expect } from 'vitest';
import {
  MarkupBuilder, EdlBuilder, EndBuilder, LinkBuilder, SpanBuilder, Builder, PointerBuilder, DocModelBuilderBuilder
} from '../Testing/test-builders';
import { InlinePointer, LinkPointer } from '@commonplace/core';
import { definesSemanticClassType, definesSequenceType, metatype } from '../well-known-objects';
import { DocuverseBuilder } from '../Testing/docuverse-builder';
import { InlineBuilder } from '../Testing/test-builders2';

function aSpan() {
  return SpanBuilder().withLength(10).withContent(new Array(11).join( "#" ));
}

function anEnd(name) {
  return EndBuilder().withName(name);
}

function anEdl({name} = {}) {
  let builder = EdlBuilder(name);
  return builder;
}

function anEdlWithSpan(args) {
  return anEdl(args).withTarget(aSpan());
}

function aLink(targetBuilder, ...attributePairs) {
  let type = attributePairs.length >= 2 ? `${attributePairs[0]}:${attributePairs[1]}` : "unspecified type";
  let target = PointerBuilder(targetBuilder);
  let builder = LinkBuilder().withName(type).withType(InlinePointer(type));
  if (target) {
    builder.withEnd(anEnd().withPointer(target));
  }

  return builder;
}

function aSequenceMetalinkType(sequenceEndName) {
  let metalink = LinkBuilder(definesSequenceType)
    .withName(`sequence metalink`)
    .withEnd(EndBuilder().withName("end").withPointer(InlinePointer(sequenceEndName)));
  let type = LinkBuilder(metatype, [undefined, [LinkPointer("sequence metalink")]]).withName("target type");
  return [type, metalink];
}

function aDmbWithSpan() {
  let dmb = aDmb(anEdl().withTarget(aSpan()));
  return dmb;
}

function aMarkupLink(name, ...attributeDescriptors) {
  let metalink = MarkupBuilder().withName(name)
    .endowing(...attributeDescriptors);
  return metalink;
}

function aMarkupLinkPointingTo(name, targetBuilder, ...attributeDescriptors) {
  if (targetBuilder === undefined) { throw "targetBuilder cannot be null"; }
  return aMarkupLink(name, ...attributeDescriptors)
    .withEnd(EndBuilder(["targets", [targetBuilder]]));
}

function aMarkupLinkOnSpans(name, ...attributeDescriptors) {
  return aMarkupLink(name, ...attributeDescriptors)
    .withEnd(EndBuilder(["clip types", [InlinePointer("span")]]));
}

function aMarkupLinkOnEdls(name, type, ...attributeDescriptors) {
  return aMarkupLink(name, ...attributeDescriptors)
    .withEnd(EndBuilder(["edl types", [InlinePointer(type)]]));
}

function aDmb(edlBuilder) {
  return DocModelBuilderBuilder(edlBuilder);
}

function getZettel(hierarchy, clip) {
  let zettel = hierarchy.zettel.find(z => clip.endowsTo(z.pointer));
  if (zettel) { return zettel; }
  return hierarchy.zettel.filter(z => z.pointer.pointerType === "edl").map(z => getZettel(z, clip)).find(x => x);
}

function makeFromDmb(docBuilder, target) {
  target = target ? target.build() : docBuilder.target.build();
  let dmb = docBuilder.build();
  let doc = dmb.build();
  let targetZettel = getZettel(doc, target);
  if (!targetZettel) { throw(`make failed, target Zettel not found. Pointer was ${JSON.stringify(target)}.`); }
  let markup = targetZettel.markup;
  return markup;
}

function getLinks(edlModel) {
  return Array.from(edlModel.links.values()).sort(l => l.index);
}

describe('markup', () => {
  it('returns no attributes if there are no pointers', () => {
    let dmb = aDmbWithSpan();
    let markup = makeFromDmb(dmb);
    expect([...markup.values()]).toEqual([]);
  });

  it('returns the default direct value if there are no non-default links', () => {
    let dmb = aDmbWithSpan();
    dmb.withDefault(aMarkupLinkOnSpans("1", "attr1", "val1", "direct"));
    let markup = makeFromDmb(dmb);

    expect(markup.get("attr1")).toBe("val1");
  });

  it('does not return the default direct value from the containing EDL', () => {
    let dmb = aDmbWithSpan().onEdl(edl => edl.withType(InlinePointer("edl type")));
    dmb.withDefault(aMarkupLinkOnEdls("1", "edl type", "attr1", "val1", "direct"));
    let markup = makeFromDmb(dmb);

    expect([...markup.values()]).toEqual([]);
  });

  it('returns the default content value if there are no links', () => {
    let dmb = aDmbWithSpan().onEdl(edl => edl.withType(InlinePointer("edl type")));
    dmb.withDefault(aMarkupLinkOnSpans("1", "attr1", "val1", "content"));
    let markup = makeFromDmb(dmb);

    expect(markup.get("attr1")).toBe("val1");
  });

  it('returns the default content value from the containing EDL if there are no links', () => {
    let dmb = aDmbWithSpan().onEdl(edl => edl.withType(InlinePointer("edl type")));
    dmb.withDefault(aMarkupLinkOnEdls("1", "edl type", "attr1", "val1", "content"));
    let markup = makeFromDmb(dmb);

    expect(markup.get("attr1")).toBe("val1");
  });

  // TODO the below test would make sense for semantic attributes, but doesn't for markup

  // it('returns the value when the link is in the Edl but the metalink is in the defaults', () => {
  //   let dmb = aDmbWithSpan();
  //   let link = aLink(dmb.target, "attr1", "val1");
  //   let metalink = aMetalink(link, aDirectMetalink, "attr1", "val1");
  //   dmb.withDefault(metalink);
  //   dmb.edl.withLink(link);
  //   let attributes = makeFromEdlZettel(dmb.target, dmb);

  //   let values = attributes.values();

  //   expect(values).hasAttribute("attr1", "val1");
  // });

  it('does not return a content attribute value inherited through a non-sequence link', () => {
    let dmb = aDmbWithSpan();
    let intermediateLink = aLink(dmb.target);
    dmb.withMarkupLinkPointingTo(intermediateLink, "attr1", "val1", "content");
    dmb.withLink(intermediateLink);

    let markup = makeFromDmb(dmb);

    expect([...markup.values()]).toEqual([]);
  });

  it('returns a content attribute value inherited through a sequence link if it is part of a valid sequence', () => {
    // Here we have a sequence link, and a second link that points to the sequence link and endows a content attribute.
    // The zettel receives the value by inheritance, because it is part of the sequence.
    let dmb = aDmbWithSpan();
    let sequenceLink = LinkBuilder(LinkPointer("target type"), ["sequence", [dmb.target]]).withName("sequence link");
    dmb.withMarkupLinkPointingTo(sequenceLink, "attr1", "val1", "content");
    let sequenceMetalink = aSequenceMetalinkType("sequence");
    dmb.withLinks(sequenceLink, ...sequenceMetalink);

    let markup = makeFromDmb(dmb);

    expect(markup.get("attr1")).toBe("val1");
  });

  it('does not return a content attribute value inherited through a sequence link if it is not part of a valid sequence', () => {
    // Here we have a sequence link, and a second link that points to the sequence link and endows a content attribute.
    // The attribute is not on the zettel because the second link points to the sequence link, not the zettel, and therefore the
    // attribute can only be received by inheritance from a sequence, but the sequence link does not form a valid sequence here.
    let dmb = aDmbWithSpan();
    let sequenceLink = LinkBuilder(LinkPointer("target type"), ["sequence", [dmb.target, aSpan()]]).withName("sequence link");
    dmb.withMarkupLinkPointingTo(sequenceLink, "attr1", "val1", "content");
    let sequenceMetalink = aSequenceMetalinkType("sequence");
    dmb.withLinks(sequenceLink, ...sequenceMetalink);

    let markup = makeFromDmb(dmb);

    expect([...markup.values()]).toEqual([]);
  });

  // it('returns a content attribute endowed directly by a sequence link even if it is not part of a valid sequence', () => {
  //   // Note here we have two metalinks on the same link, one endowing a sequence and the other endowing an attribute. The
  //   // zettel gets the attribute because it is not inheriting it via the sequence, but is getting it directly from the link,
  //   // which points directly at the zettel.
  //   let dmb = aDmbWithSpan();
  //   let sequenceLink = LinkBuilder(undefined, ["sequence", [dmb.target, aSpan()]]).withName("sequence link");
  //   let contentLink = aMarkupLinkPointingTo("1", sequenceLink, "attr1", "val1");
  //   let sequenceMetalink = aSequenceMetalink(sequenceLink, "sequence");
  //   dmb.withLinks(sequenceLink, contentLink, sequenceMetalink);

  //   let markup = makeFromDmb(dmb);

  //   expect([...markup.values()]).toEqual([]);
  // });

  it('does not return a direct attribute value inherited through a sequence', () => {
    // Here we have a sequence link, and a second link that points to the sequence link and endows a content attribute.
    // The zettel receives the value by inheritance, because it is part of the sequence.
    let dmb = aDmbWithSpan();
    let sequenceLink = LinkBuilder(LinkPointer("target type"), ["sequence", [dmb.target]]).withName("sequence link");
    dmb.withMarkupLinkPointingTo(sequenceLink, "attr1", "val1", "direct");
    let sequenceMetalink = aSequenceMetalinkType("sequence");
    dmb.withLinks(sequenceLink, ...sequenceMetalink);

    let markup = makeFromDmb(dmb);

    expect([...markup.values()]).toEqual([]);
  });

  describe("direct attributes", () => {
    it('returns the value endowed by a pointer targeting the object directly', () => {
      let dmb = aDmbWithSpan().withMarkupLinkPointingToTarget("attr1", "val1", "direct");

      let markup = makeFromDmb(dmb);

      expect(markup.get("attr1")).toBe("val1");
    });

    it('returns the value endowed by a clip type link if the target matches the clip type', () => {
      let dmb = aDmbWithSpan().withMarkupLinkOnClips("span", "attr1", "span value", "direct");

      let markup = makeFromDmb(dmb);

      expect(markup.get("attr1")).toBe("span value");
    });

    it('does not return the value endowed by a clip type link if the target does not match the clip type', () => {
      let dmb = aDmbWithSpan().withMarkupLinkOnClips("image", "attr1", "image value", "direct");

      let markup = makeFromDmb(dmb);

      expect([...markup.values()]).toEqual([]);
    });

    it('returns the value endowed by an Edl type link if the target matches the Edl type', () => {
      let child = anEdl({ name: "child" }).withType(InlinePointer("edl type"));
      let dmb = aDmb(anEdl({name: "parent"}).withClip(child))
        .withMarkupLinkOnEdls("edl type", "attr1", "edl type value", "direct");

      let markup = makeFromDmb(dmb, PointerBuilder(child));

      expect(markup.get("attr1")).toBe("edl type value");
    });

    it('does not return the value endowed by an Edl type link if the target does not match the Edl type', () => {
      let child = anEdl({ name: "child" }).withType(InlinePointer("edl type"));
      let dmb = aDmb(anEdl({name: "parent"}).withClip(child))
        .withMarkupLinkOnEdls("wrong edl type", "attr1", "edl type value", "direct");

      let markup = makeFromDmb(dmb, PointerBuilder(child));

      expect([...markup.values()]).toEqual([]);
    });

    it('returns the value endowed by a link type link if the target matches the link type', () => {
      let targetLink = LinkBuilder(InlinePointer("link type"));
      let dmb = aDmb(anEdl())
        .withLink(targetLink)
        .withMarkupLinkOnLinks("link type", "attr1", "link value", "direct");

      let markup = getLinks(dmb.build().build())[0].markup;

      expect(markup.get("attr1")).toBe("link value");
    });

    it('does not return the value endowed by a link type link if the target does not match the link type', () => {
      let targetLink = LinkBuilder(InlinePointer("link type"));
      let dmb = aDmb(anEdl())
        .withLink(targetLink)
        .withMarkupLinkOnLinks("wrong link type", "attr1", "link value", "direct");

      let markup = getLinks(dmb.build().build())[0].markup;

      expect([...markup.values()]).toEqual([]);
    });

    it('returns the value endowed by a class link if the target has the class', () => {
      let dv = DocuverseBuilder().add(obj => ({
        target: obj.aLink(),
        klass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
        type: obj.aLink(metatype).withEnd([undefined, [obj.klass]]),
        endower: obj.aLink(obj.type).withEnd(["endowing end", [obj.target]]),
        attr1: obj.aMarkupRule().endowing("attr1", "class value", "direct")
          .withClasses(obj.type),
        edl: obj.anEdl().withLinks(obj.target, obj.attr1, obj.endower),
        dmb: obj.aDocModelBuilder(obj.edl)
      })).build();

      let markup = getLinks(dv.dmb.build())[0].markup;

      expect(markup.get("attr1")).toBe("class value");
    });

    it('does not return the value endowed by a class link if the target has the wrong class', () => {
      let dv = DocuverseBuilder().add(obj => ({
        target: obj.aLink(),
        klass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
        type: obj.aLink(metatype).withEnd([undefined, [obj.klass]]),
        badKlass: obj.aLink(definesSemanticClassType),
        badType: obj.aLink(metatype).withEnd([undefined, [obj.badKlass]]),
        endower: obj.aLink(obj.type).withEnd(["endowing end", [obj.target]]),
        attr1: obj.aMarkupRule().endowing("attr1", "class value", "direct")
          .withClasses(obj.badType),
        edl: obj.anEdl().withLinks(obj.target, obj.attr1, obj.endower),
        dmb: obj.aDocModelBuilder(obj.edl)
      })).build();

      let markup = getLinks(dv.dmb.build())[0].markup;

      expect([...markup.values()]).toEqual([]);
    });

    it('returns all values of all attributes', () => {
      let dmb = aDmbWithSpan()
        .withMarkupLinkPointingToTarget("attr1", "val1", "direct")
        .withMarkupLinkPointingToTarget("attr2", "val2", "direct")
        .withMarkupLinkPointingToTarget("attr3", "val3", "direct");

      let markup = makeFromDmb(dmb);

      expect(markup.get("attr1")).toBe("val1");
      expect(markup.get("attr2")).toBe("val2");
      expect(markup.get("attr3")).toBe("val3");
    });

    it('returns the later value in the Zettel rather than the earlier one', () => {
      let dmb = aDmbWithSpan()
        .withMarkupLinkPointingToTarget("attr1", "first", "direct")
        .withMarkupLinkPointingToTarget("attr1", "second", "direct");

      let markup = makeFromDmb(dmb);

      expect(markup.get("attr1")).toBe("second");
    });

    it('returns the value endowed by a link in the parent', () => {
      let child = anEdlWithSpan({ name: "child" });
      let parent = anEdl({name: "parent"})
        .withClip(child)
        .withLinks(aMarkupLinkPointingTo("1", child.target, "attr1", "val1", "direct"));

      let zettel = getZettel(aDmb(parent).build().build(), child.target.build());

      expect(zettel.markup.get("attr1")).toBe("val1");
    });

    it('returns the value in the child in preference to that in the parent', () => {
      let child = anEdlWithSpan({ name: "child" });
      child.withLinks(aMarkupLinkPointingTo("1", child.target, "attr1", "child value", "direct"));
      let parent = aDmb(anEdl({name: "parent"}).withClip(child))
        .withMarkupLinkPointingTo(child.target, "attr1", "parent value", "direct");

      let zettel = getZettel(parent.build().build(), child.target.build());

      expect(zettel.markup.get("attr1")).toBe("child value");
    });

    it('does not return direct attributes of containers', () => {
      let dmb = aDmbWithSpan();
      dmb.withMarkupLinkPointingTo(dmb.edl, "attr1", "val", "direct");

      let markup = makeFromDmb(dmb);

      expect([...markup.values()]).toEqual([]);
    });

    it('prefers a value from the links to a default value', () => {
      let dmb = aDmbWithSpan()
        .withMarkupLinkOnSpans("attr1", "link value", "direct")
        .withDefault(aMarkupLinkOnSpans("2", "attr1", "default value", "direct"));

      let markup = makeFromDmb(dmb);

      expect(markup.get("attr1")).toBe("link value");
    });

    it('prefers a targeted value to a clip type value', () => {
      let dmb = aDmbWithSpan()
        .withMarkupLinkPointingToTarget("attr1", "targeted value", "direct")
        .withMarkupLinkOnSpans("attr1", "span value", "direct");

      let markup = makeFromDmb(dmb);

      expect(markup.get("attr1")).toBe("targeted value");
    });

    it('prefers a targeted value to an Edl type value', () => {
      let child = anEdl({ name: "child" }).withType(InlinePointer("edl type"));
      let dmb = aDmb(anEdl({ name: "parent" }).withClip(child))
        .withMarkupLinkPointingTo(child, "attr1", "targeted value", "direct")
        .withMarkupLinkOnEdls("edl type", "attr1", "edl type value", "direct");

      let markup = makeFromDmb(dmb, PointerBuilder(child));

      expect(markup.get("attr1")).toBe("targeted value");
    });

    it('prefers a targeted value to a link type value', () => {
      let targetLink = LinkBuilder(InlinePointer("link type"));
      let dmb = aDmb(anEdl())
        .withLink(targetLink)
        .withMarkupLinkPointingTo(targetLink, "attr1", "targeted value", "direct")
        .withMarkupLinkOnLinks("link type", "attr1", "link value", "direct");

      let markup = getLinks(dmb.build().build())[0].markup;

      expect(markup.get("attr1")).toBe("targeted value");
    });

    it('prefers a scoped value to an unscoped value', () => {
      let dv = DocuverseBuilder().add(obj => ({
        target: obj.aLink(),
        klass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
        type: obj.aLink(metatype).withEnd([undefined, [obj.klass]]),
        endower: obj.aLink(obj.type).withEnd(["endowing end", [obj.target]]),
        attr1Unscoped: obj.aMarkupRule().endowing("attr1", "unscoped value", "direct")
          .withClasses(obj.type),

        edlKlass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
        edlEndowerType: obj.aLink(metatype).withEnd([undefined, [obj.edlKlass]]),
        edlEndower: obj.aLink(obj.edlEndowerType).withEnd(["endowing end", [obj.edl]]),
        attr1Scoped: obj.aMarkupRule().endowing("attr1", "scoped value", "direct")
          .withClasses(obj.type)
          .withLevelScopes([{level: obj.edlEndowerType}]),

        edl: obj.anEdl().withLinks(obj.target, obj.attr1Scoped, obj.attr1Unscoped, obj.endower),
        parentEdl: obj.anEdl().withLinks(obj.edlEndower).withClip(obj.edl),
        dmb: obj.aDocModelBuilder(obj.parentEdl)
      })).build();

      const parent = dv.dmb.build();
      const target = getLinks(parent.zettel[0])[1]; // target is at index 1 because the link in the parent
                                                    // will be copied down.
      let markup = target.markup;

      expect(markup.get("attr1")).toBe("scoped value");
    });

    it('prefers a closer scoped value to a more distant scoped value', () => {
      let dv = DocuverseBuilder().add(obj => ({
        target: obj.aLink(),
        klass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
        type: obj.aLink(metatype).withEnd([undefined, [obj.klass]]),
        endower: obj.aLink(obj.type).withEnd(["endowing end", [obj.target]]),

        edlKlass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
        edlEndowerType: obj.aLink(metatype).withEnd([undefined, [obj.edlKlass]]),
        edlEndower: obj.aLink(obj.edlEndowerType).withEnd(["endowing end", [obj.edl]]),
        nearScoped: obj.aMarkupRule().endowing("attr1", "near value", "direct")
          .withClasses(obj.type)
          .withLevelScopes([{level: obj.edlEndowerType}]),

        distantEdlKlass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
        distantEdlEndowerType: obj.aLink(metatype).withEnd([undefined, [obj.distantEdlKlass]]),
        distantEdlEndower: obj.aLink(obj.distantEdlEndowerType).withEnd(["endowing end", [obj.parentEdl]]),
        distantScoped: obj.aMarkupRule().endowing("attr1", "far value", "direct")
          .withClasses(obj.type)
          .withLevelScopes([{level: obj.distantEdlEndowerType}]),

        edl: obj.anEdl().withLinks(obj.target, obj.distantScoped, obj.nearScoped, obj.endower),
        parentEdl: obj.anEdl().withLinks(obj.edlEndower).withClip(obj.edl),
        grandparentEdl: obj.anEdl().withLinks(obj.distantEdlEndower).withClip(obj.parentEdl),
        dmb: obj.aDocModelBuilder(obj.grandparentEdl)
      })).build();

      const parent = dv.dmb.build();
      const target = getLinks(parent.zettel[0].zettel[0])[2]; // target is at index 2 because the link in the ancestor
                                                              // will be copied down.
      let markup = target.markup;

      expect(markup.get("attr1")).toBe("near value");
    });

    // TODO: these tests fail because level scoping was not implemented properly. It will be reimplemented
    // as part of the rewrite, when markup rules scopes will be restricted to lower layers only. (i.e. the
    // scope of a scoped rule cannot be wider than the scope of the markup link itself)/

    // it('prefers a deeper scope to a shallower scope', () => {
    //   let dv = DocuverseBuilder().add(obj => ({
    //     target: obj.aLink(),
    //     klass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
    //     type: obj.aLink(metatype).withEnd([undefined, [obj.klass]]),
    //     endower: obj.aLink(obj.type).withEnd(["endowing end", [obj.target]]),

    //     edlKlass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
    //     edlEndowerType: obj.aLink(metatype).withEnd([undefined, [obj.edlKlass]]),
    //     edlEndower: obj.aLink(obj.edlEndowerType).withEnd(["endowing end", [obj.edl]]),
        
    //     distantEdlEndower: obj.aLink(obj.edlEndowerType).withEnd(["endowing end", [obj.parentEdl]]),

    //     shallowScope: obj.aMarkupRule().endowing("attr1", "shalllow value", "direct")
    //     .withClasses(obj.type)
    //     .withLevelScopes([{level: obj.edlEndowerType, depth: 1}]),
    //     deepScope: obj.aMarkupRule().endowing("attr1", "deep value", "direct")
    //     .withClasses(obj.type)
    //     .withLevelScopes([{level: obj.edlEndowerType, depth: 2}]),

    //     edl: obj.anEdl().withLinks(obj.target, obj.deepScope, obj.shallowScope, obj.endower),
    //     parentEdl: obj.anEdl().withLinks(obj.edlEndower).withClip(obj.edl),
    //     grandparentEdl: obj.anEdl().withLinks(obj.distantEdlEndower).withClip(obj.parentEdl),
    //     dmb: obj.aDocModelBuilder(obj.grandparentEdl)
    //   })).build();

    //   const parent = dv.dmb.build();
    //   const target = getLinks(parent.zettel[0].zettel[0])[2]; // target is at index 2 because the link in the ancestor
    //                                                           // will be copied down.
    //   let markup = target.markup;

    //   expect(markup.get("attr1")).toBe("deep value");
    // });

    // it('a scoped rule does not match scopes defined at a higher level than the rule link itself', () => {
    //   let dv = DocuverseBuilder().add(obj => ({
    //     target: obj.aLink(),
    //     klass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
    //     type: obj.aLink(metatype).withEnd([undefined, [obj.klass]]),
    //     endower: obj.aLink(obj.type).withEnd(["endowing end", [obj.target]]),

    //     edlKlass: obj.aLink(definesSemanticClassType).withEnd(["end", [InlineBuilder("endowing end")]]),
    //     edlEndowerType: obj.aLink(metatype).withEnd([undefined, [obj.edlKlass]]),
    //     edlEndower: obj.aLink(obj.edlEndowerType).withEnd(["endowing end", [obj.edl]]),
        
    //     distantEdlEndower: obj.aLink(obj.edlEndowerType).withEnd(["endowing end", [obj.parentEdl]]),

    //     deepScope: obj.aMarkupRule().endowing("attr1", "deep value", "direct")
    //     .withClasses(obj.type)
    //     .withLevelScopes([{level: obj.edlEndowerType, depth: 2}]),

    //     edl: obj.anEdl().withLinks(obj.target, obj.deepScope, obj.endower),
    //     parentEdl: obj.anEdl().withLinks(obj.edlEndower).withClip(obj.edl),
    //     grandparentEdl: obj.anEdl().withLinks(obj.distantEdlEndower).withClip(obj.parentEdl),
    //     dmb: obj.aDocModelBuilder(obj.grandparentEdl)
    //   })).build();

    //   const parent = dv.dmb.build();
    //   const target = getLinks(parent.zettel[0].zettel[0])[2]; // target is at index 2 because the link in the ancestor
    //                                                           // will be copied down.
    //   let markup = target.markup;

    //   expect(markup.get("attr1")).toBe(undefined);
    // });
  });

  describe("content attributes", () => {
    describe.each(
      [["span"], ["edl"], ["parent edl"]]
    )("%s level", level => {

      function anEdlHierarchy() {
        let child = anEdlWithSpan({name: "child"});
        let parent = anEdl({ name: "parent" }).withClip(child);
        let linkCount = 1;

        let builder = Builder(() => parent.build(), {
          parent,
          child,
          target: child.target,
          defaults: undefined,
          pointerBuilderForLevel: () =>
            level === "span"
              ? builder.target : level === "edl"
                ? builder.child : (level === "parent edl"
                  ? builder.parent : undefined),
          withContentLink(attributeName, attributeValue) {
            let link = aMarkupLinkPointingTo("parent link " + linkCount++, builder.pointerBuilderForLevel(level), attributeName, attributeValue, "content");
            builder.parent.withLink(link);
            return builder;
          },
          withDefault(attributeName, attributeValue) {
            builder.defaults = aMarkupLinkPointingTo("default link", builder.pointerBuilderForLevel(level), attributeName, attributeValue, "content");
            return builder;
          }
        });

        return builder;
      };

      function make(hierarchy) {
        let dmb = aDmb(hierarchy.parent);
        if (hierarchy.defaults) { dmb.withDefault(hierarchy.defaults); }
        return makeFromDmb(dmb, hierarchy.target);
      }

      it('returns the value endowed by a pointer', () => {
        let hierarchy = anEdlHierarchy().withContentLink("attr1", "val1");

        let markup = make(hierarchy);

        expect(markup.get("attr1")).toBe("val1");
      });

      it('returns all values of all attributes', () => {
        let hierarchy = anEdlHierarchy()
          .withContentLink("attr1", "val1")
          .withContentLink("attr2", "val2")
          .withContentLink("attr3", "val3");

        let markup = make(hierarchy);

        expect(markup.get("attr1")).toBe("val1");
        expect(markup.get("attr2")).toBe("val2");
        expect(markup.get("attr3")).toBe("val3");
      });

      it('returns the later value in the Zettel rather than the earlier one', () => {
        let hierarchy = anEdlHierarchy()
          .withContentLink("attr1", "first")
          .withContentLink("attr1", "second");

        let markup = make(hierarchy);

        expect(markup.get("attr1")).toBe("second");
      });

      it('prefers a value from the links to a default value', () => {
        let hierarchy = anEdlHierarchy()
          .withContentLink("attr1", "content link value")
          .withDefault("attr1", "default");

        let markup = make(hierarchy);

        expect(markup.get("attr1")).toBe("content link value");
      });
    });

    it('returns the value in the child in preference to that in the parent', () => {
      let child = anEdlWithSpan({name: "child"});
      child.withLink(aMarkupLinkPointingTo("1", child.target, "attr1", "child value", "content"));
      let parent = aDmb(anEdl({ name: "parent" }).withClip(child))
        .withMarkupLinkPointingTo(child.target, "attr1", "parent value", "content");

        let markup = makeFromDmb(parent, child.target);

        expect(markup.get("attr1")).toBe("child value");
    });

    it('returns direct values in preference to content values', () => {
      let dmb = aDmbWithSpan()
        .withMarkupLinkPointingToTarget("attr1", "direct value", "direct")
        .withMarkupLinkPointingToTarget("attr1", "content value", "content");

        let markup = makeFromDmb(dmb);

        expect(markup.get("attr1")).toBe("direct value");
    });

    it('returns the value endowed by a clip type link if the target matches the clip type', () => {
      let dmb = aDmbWithSpan().withMarkupLinkOnClips("span", "attr1", "span value", "content");

      let markup = makeFromDmb(dmb);

      expect(markup.get("attr1")).toBe("span value");
    });

    it('does not return the value endowed by a clip type link if the target does not match the clip type', () => {
      let dmb = aDmbWithSpan().withMarkupLinkOnClips("image", "attr1", "image value", "content");

      let markup = makeFromDmb(dmb);

      expect([...markup.values()]).toEqual([]);
    });

    it('returns the value endowed by an Edl type link if the target matches the Edl type', () => {
      let child = anEdl({ name: "child" }).withType(InlinePointer("edl type"));
      let dmb = aDmb(anEdl({name: "parent"}).withClip(child))
        .withMarkupLinkOnEdls("edl type", "attr1", "edl type value", "content");

      let markup = makeFromDmb(dmb, PointerBuilder(child));

      expect(markup.get("attr1")).toBe("edl type value");
    });

    it('does not return the value endowed by an Edl type link if the target does not match the Edl type', () => {
      let child = anEdl({ name: "child" }).withType(InlinePointer("edl type"));
      let dmb = aDmb(anEdl({name: "parent"}).withClip(child))
        .withMarkupLinkOnEdls("wrong edl type", "attr1", "edl type value", "content");

      let markup = makeFromDmb(dmb, PointerBuilder(child));

      expect([...markup.values()]).toEqual([]);
    });

    it('returns the value endowed by a link type link if the target matches the link type', () => {
      let targetLink = LinkBuilder(InlinePointer("link type"));
      let dmb = aDmb(anEdl())
        .withLink(targetLink)
        .withMarkupLinkOnLinks("link type", "attr1", "link value", "content");

      let markup = getLinks(dmb.build().build())[0].markup;

      expect(markup.get("attr1")).toBe("link value");
    });

    it('does not return the value endowed by a link type link if the target does not match the link type', () => {
      let targetLink = LinkBuilder(InlinePointer("link type"));
      let dmb = aDmb(anEdl())
        .withLink(targetLink)
        .withMarkupLinkOnLinks("wrong link type", "attr1", "link value", "content");

      let markup = getLinks(dmb.build().build())[0].markup;

      expect([...markup.values()]).toEqual([]);
    });

    it('prefers a targeted value to a clip type value', () => {
      let dmb = aDmbWithSpan()
        .withMarkupLinkPointingToTarget("attr1", "targeted value", "content")
        .withMarkupLinkOnSpans("attr1", "span value", "content");

      let markup = makeFromDmb(dmb);

      expect(markup.get("attr1")).toBe("targeted value");
    });

    it('prefers a targeted value to an Edl type value', () => {
      let child = anEdl({ name: "child" }).withType(InlinePointer("edl type"));
      let dmb = aDmb(anEdl({ name: "parent" }).withClip(child))
        .withMarkupLinkPointingTo(child, "attr1", "targeted value", "content")
        .withMarkupLinkOnEdls("edl type", "attr1", "edl type value", "content");

      let markup = makeFromDmb(dmb, PointerBuilder(child));

      expect(markup.get("attr1")).toBe("targeted value");
    });

    it('prefers a targeted value to a link type value', () => {
      let targetLink = LinkBuilder(InlinePointer("link type"));
      let dmb = aDmb(anEdl())
        .withLink(targetLink)
        .withMarkupLinkPointingTo(targetLink, "attr1", "targeted value", "content")
        .withMarkupLinkOnLinks("link type", "attr1", "link value", "content");

      let markup = getLinks(dmb.build().build())[0].markup;

      expect(markup.get("attr1")).toBe("targeted value");
    });
  });
});
