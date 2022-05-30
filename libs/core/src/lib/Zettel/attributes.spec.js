import { expect, it, describe } from '@jest/globals';
import { attributesTesting } from './attributes';
import { MetalinkBuilder, EdlBuilder, EdlZettelBuilder, EndsetBuilder, LinkBuilder, SpanBuilder, Builder, PointerTypePointerBuilder, PointerBuilder } from '../builders';

expect.extend({
 hasAttribute: attributesTesting.hasAttribute,
 hasExactlyAttributes: attributesTesting.hasExactlyAttributes
});

function aSpan() {
  return SpanBuilder().withLength(10).withContent(new Array(11).join( "#" ));
}

function anEndset(name) {
  return EndsetBuilder().withName(name);
}

function aLink(name, target) {
  let builder = LinkBuilder().withName(name).withType(name);
  if (target) {
    builder.withEndset(anEndset().withPointer(target));
  }
  return builder;
}

function aDirectMetalink(name) {
  return MetalinkBuilder("direct").withName(name);
}

function aContentMetalink(name) {
  return MetalinkBuilder("content").withName(name);
}

function anEdl({name} = {}) {
  return EdlBuilder(name);
}

function anEdlWithSpan(args) {
  return anEdl(args).withTarget(aSpan());
}

function anEdlZettel({ edl, name } = {}) {
  edl = edl ?? anEdl({name});
  return EdlZettelBuilder(edl);
}

function aDirectLinkAndMetalinkPointingTo(pointerType, targetBuilder, ...attributePairs) {
  return aLinkAndMetalink(pointerType, aDirectMetalink, targetBuilder, ...attributePairs);
}

function aContentLinkAndMetalinkPointingTo(pointerType, targetBuilder, ...attributePairs) {
  return aLinkAndMetalink(pointerType, aContentMetalink, targetBuilder, ...attributePairs);
}

function aLinkAndMetalink(pointerType, metalinkFn, targetBuilder, ...attributePairs) {
  let type = `${attributePairs[0]}:${attributePairs[1]}`;
  let pointer = pointerType == "specific" ? PointerBuilder(targetBuilder) : PointerTypePointerBuilder(targetBuilder);
  let endowingLink = aLink(type, pointer);
  let metaLink = metalinkFn(`metalink for ${type}`).pointingTo(endowingLink).endowing(...attributePairs);
  return [endowingLink, metaLink];
}

function anEdlZettelWithSpan() {
  let edl = anEdlWithSpan();
  let builder = anEdlZettel({edl, parent, name});
  builder.target = edl.target;
  builder.withLinkWithDirectAttributes = (pointerType, attributeName, attributeValue) => {
    let links = aDirectLinkAndMetalinkPointingTo(pointerType, edl.target, attributeName, attributeValue);
    edl.withLinks(...links);
    return builder;
  };
  return builder;
}

function getZettel(hierarchy, clip) {
  let zettel = hierarchy.children.find(z => clip.endowsTo(z.clip));
  if (zettel) { return zettel; }
  return hierarchy.children.filter(z => z.clip.pointerType === "edl").map(z => getZettel(z, clip)).find(x => x);
}

function makeFromEdlZettel(targetBuilder, rootEdlZ) {
  let target = targetBuilder.build();
  let targetZettel = getZettel(rootEdlZ.build(), target);
  if (!targetZettel) { throw(`make failed, target Zettel not found. Pointer was ${JSON.stringify(target)}.`); }
  let attributes = targetZettel.attributes();
  return attributes;
}

function make(target, edl) {
  let edlZ = anEdlZettel({edl});
  let attributes = makeFromEdlZettel(target, edlZ);
  return attributes;
}

it('returns no attributes if there are no pointers', () => {
  let target = aSpan();
  let attributes = make(target, anEdl().withClip(target));
  expect(attributes.values()).hasExactlyAttributes();
});

it('returns the default direct value if there are no links', () => {
  let edlZ = anEdlZettelWithSpan();
  edlZ.withDefaults(...aDirectLinkAndMetalinkPointingTo("pointer Type", edlZ.target, "attr1", "val1"));
  let attributes = makeFromEdlZettel(edlZ.target, edlZ);

  let values = attributes.values();

  expect(values).hasAttribute("attr1", "val1");
});

it('does not return the default direct value from the containing EDL', () => {
  let edlZ = anEdlZettelWithSpan();
  edlZ.withDefaults(...aDirectLinkAndMetalinkPointingTo("pointer Type", edlZ.edl, "attr1", "val1"));
  let attributes = makeFromEdlZettel(edlZ.target, edlZ);

  let values = attributes.values();

  expect(values).hasExactlyAttributes();
});

it('returns the default content value if there are no links', () => {
  let edlZ = anEdlZettelWithSpan();
  edlZ.withDefaults(...aContentLinkAndMetalinkPointingTo("pointer Type", edlZ.target, "attr1", "val1"));
  let attributes = makeFromEdlZettel(edlZ.target, edlZ);

  let values = attributes.values();

  expect(values).hasAttribute("attr1", "val1");
});

it('returns the default content value from the containing EDL if there are no links', () => {
  let edlZ = anEdlZettelWithSpan();
  edlZ.withDefaults(...aContentLinkAndMetalinkPointingTo("pointer Type", edlZ.edl, "attr1", "val1"));
  let attributes = makeFromEdlZettel(edlZ.target, edlZ);

  let values = attributes.values();

  expect(values).hasAttribute("attr1", "val1");
});

describe("direct attributes", () => {
  describe.each(
    [["specific"], ["pointer type"]]
  )("%s pointer", pointerKind => {
  
    it('returns the value endowed by a pointer', () => {
      let edlZ = anEdlZettelWithSpan().withLinkWithDirectAttributes(pointerKind, "attr1", "val1");
      let attributes = makeFromEdlZettel(edlZ.target, edlZ);
  
      let values = attributes.values();
  
      expect(values).hasAttribute("attr1", "val1");
    });
  
    it('returns all values of all attributes', () => {
      let edlZ = anEdlZettelWithSpan()
        .withLinkWithDirectAttributes(pointerKind, "attr1", "val1")
        .withLinkWithDirectAttributes(pointerKind, "attr2", "val2")
        .withLinkWithDirectAttributes(pointerKind, "attr3", "val3");
      let attributes = makeFromEdlZettel(edlZ.target, edlZ);
  
      let values = attributes.values();
  
      expect(values).hasAttribute("attr1", "val1");
      expect(values).hasAttribute("attr2", "val2");
      expect(values).hasAttribute("attr3", "val3");
    });
  
    it('returns the later value in the Zettel rather than the earlier one', () => {
      let edlZ = anEdlZettelWithSpan()
        .withLinkWithDirectAttributes(pointerKind, "attr1", "first")
        .withLinkWithDirectAttributes(pointerKind, "attr1", "second");
      let attributes = makeFromEdlZettel(edlZ.target, edlZ);
  
      let values = attributes.values();
  
      expect(values).hasAttribute("attr1", "second");
    });
  
    it('returns the value endowed by a link in the parent', () => {
      let child = anEdlWithSpan({name: "child"});
      let parent = anEdl({name: "parent"})
        .withClip(child)
        .withLinks(...aDirectLinkAndMetalinkPointingTo(pointerKind, child.target, "attr1", "val1"));
      let attributes = makeFromEdlZettel(child.target, anEdlZettel({edl: parent}));

      let values = attributes.values();
  
      expect(values).hasAttribute("attr1", "val1");
    });
  
    it('returns the value in the child in preference to that in the parent', () => {
      let child = anEdlWithSpan({name: "child" });
      child.withLinks(...aDirectLinkAndMetalinkPointingTo(pointerKind, child.target, "attr1", "child value"));
      let parent = anEdl({ name: "parent" })
        .withClip(child)
        .withLinks(...aDirectLinkAndMetalinkPointingTo(pointerKind, child.target, "attr1", "parent value"));
      let attributes = makeFromEdlZettel(child.target, anEdlZettel({edl: parent}));
  
      let values = attributes.values();
  
      expect(values).hasAttribute("attr1", "child value");
    });
  
    it('does not return direct attributes of containing objects', () => {
      let edlZ = anEdlZettelWithSpan();
      edlZ.withLinks(...aDirectLinkAndMetalinkPointingTo(pointerKind, edlZ.edl, "attr", "val"));
  
      let values = makeFromEdlZettel(edlZ.target, edlZ).values();
  
      expect(values).hasExactlyAttributes();
    });

    it('prefers a value from the links to a default value', () => {
      let edlZ = anEdlZettelWithSpan().withLinkWithDirectAttributes(pointerKind, "attr1", "link value");
      edlZ.withDefaults(...aDirectLinkAndMetalinkPointingTo("pointer Type", edlZ.edl, "attr1", "default value"));
      let attributes = makeFromEdlZettel(edlZ.target, edlZ);
    
      let values = attributes.values();
    
      expect(values).hasAttribute("attr1", "link value");
    });
  });

  it('prefers the value endowed by a specific pointer over that by a PointerTypePointer', () => {
    let edl = anEdlWithSpan();
    edl
      .withLinks(...aDirectLinkAndMetalinkPointingTo("specific", edl.target, "attr1", "specific"))
      .withLinks(...aDirectLinkAndMetalinkPointingTo("pointer type", edl.target, "attr1", "pointer type"));

     let values = make(edl.target, edl).values();
  
    expect(values).hasAttribute("attr1", "specific");
  });
});

describe("content attributes", () => {
  describe.each(
    [["specific"], ["pointer type"]]
  )("%s pointer", pointerKind => {
    describe.each(
      [["span"], ["edl"], ["parent edl"]]
    )("%s level", level => {
    
      function anEdlHierarchy() { 
        let child = anEdlWithSpan({name: "child"});
        let parent = anEdl({name: "parent"}).withClip(child);

        let builder = Builder(() => parent.build(), {
          parent,
          child,
          target: child.target,
          defaults: undefined,
          pointerBuilderForLevel: () => 
            builder.level === "span" ? builder.target : level === "edl" ? builder.child : builder.parent,
          withContentLink(attributeName, attributeValue) {
            let links = aContentLinkAndMetalinkPointingTo(pointerKind, builder.pointerBuilderForLevel(level), attributeName, attributeValue);
            builder.parent.withLinks(...links);
            return builder;
          },
          withDefaults(attributeName, attributeValue) {
            builder.defaults = aContentLinkAndMetalinkPointingTo(pointerKind, builder.pointerBuilderForLevel(level), attributeName, attributeValue);
            return builder;
          }
        });

        return builder;
      };

      function make(hierarchy) {
        let edlZ = anEdlZettel({edl: hierarchy.parent})
        if (hierarchy.defaults) { edlZ.withDefaults(...hierarchy.defaults); }
        return makeFromEdlZettel(hierarchy.target, edlZ);
      }

      it('returns the value endowed by a pointer', () => {
        let hierarchy = anEdlHierarchy().withContentLink("attr1", "val1");
        let attributes = make(hierarchy);
    
        let values = attributes.values();
    
        expect(values).hasAttribute("attr1", "val1");
      });

      it('returns all values of all attributes', () => {
        let hierarchy = anEdlHierarchy()
          .withContentLink("attr1", "val1")
          .withContentLink("attr2", "val2")
          .withContentLink("attr3", "val3");
        let attributes = make(hierarchy);
    
        let values = attributes.values();
    
        expect(values).hasAttribute("attr1", "val1");
        expect(values).hasAttribute("attr2", "val2");
        expect(values).hasAttribute("attr3", "val3");
      });
    
      it('returns the later value in the Zettel rather than the earlier one', () => {
        let hierarchy = anEdlHierarchy()
          .withContentLink("attr1", "first")
          .withContentLink("attr1", "second");
        let attributes = make(hierarchy);
    
        let values = attributes.values();
    
        expect(values).hasAttribute("attr1", "second");
      });

      it('prefers a value from the links to a default value', () => {
        let hierarchy = anEdlHierarchy()
          .withContentLink("attr1", "content link value")
          .withDefaults("attr1", "default");
        let attributes = make(hierarchy);
    
        let values = attributes.values();
    
        expect(values).hasAttribute("attr1", "content link value");
      });
    });

    it('returns the value in the child in preference to that in the parent', () => {
      let child = anEdlWithSpan({name: "child"});
      child.withLinks(...aContentLinkAndMetalinkPointingTo(pointerKind, child.target, "attr1", "child value"));
      let parent = anEdl({ name: "parent" })
        .withClip(child)
        .withLinks(...aContentLinkAndMetalinkPointingTo(pointerKind, child.target, "attr1", "parent value"));
  
      let values = make(child.target, parent).values();
  
      expect(values).hasAttribute("attr1", "child value");
    });

    it('returns direct values in preference to content values', () => {
      let edl = anEdlWithSpan();
      edl
        .withLinks(...aDirectLinkAndMetalinkPointingTo(pointerKind, edl.target, "attr1", "direct value"))
        .withLinks(...aContentLinkAndMetalinkPointingTo(pointerKind, edl.target, "attr1", "content value"));
  
      let values = make(edl.target, edl).values();
  
      expect(values).hasAttribute("attr1", "direct value");
    });
  });

  it('prefers the value endowed by a specific pointer over that by a PointerTypePointer', () => {
    let edl = anEdlWithSpan();
    edl
      .withLinks(...aContentLinkAndMetalinkPointingTo("specific", edl.target, "attr1", "specific"))
      .withLinks(...aContentLinkAndMetalinkPointingTo("pointer type", edl.target, "attr1", "pointer type"));

     let values = make(edl.target, edl).values();
  
    expect(values).hasAttribute("attr1", "specific");
  });
});
