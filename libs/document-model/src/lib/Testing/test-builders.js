import { Part, Edl, Link, Image, definesSequenceType, markupType } from "@commonplace/core";
import { EdlPointer, InlinePointer, LinkPointer, Span, defaultsPointer } from "@commonplace/core";
import { docModelBuilderTesting } from "../DocumentModel/document-model-builder";
import { Sequence } from "../DocumentModel/sequence";

export function Builder(buildFn, extensions) {
  let obj = {
    builtObject: undefined,
    withProperty: (propName, value) => {
      obj[propName] = value;
      return obj;
    },
    pushTo: (propName, value) => {
      let array = obj[propName];
      if (array == undefined) {
        array = [];
        obj[propName] = array;
      }
      array.push(value);
      return obj;
    },
    withName: name => obj.withProperty("name", name),
    build(docuverse, nameLookup) {
      if (obj.builtObject === undefined) {
        if (obj.name === undefined && nameLookup) {
          obj.withName(nameLookup.get(obj));
        }
        obj.builtObject = buildFn(obj, docuverse);
      }
      return obj.builtObject;
    }
  };

  Object.entries(extensions).forEach(e => obj[e[0]] = e[1]);

  return obj;
}

export function SpanBuilder() {
  let obj = Builder(
    b => {
      obj.pointer = Span(b.origin ?? b.name ?? "origin", b.start ?? 1, b.length ?? 10);
      return obj.pointer;
    }, {
      content: "##########",
      withLength: len => obj.withProperty("length", len),
      withContent: content => obj.withProperty("content", content),
      withOrigin: origin => obj.withProperty("origin", origin),
      withStart: start => obj.withProperty("start", start),
      defaultPart: () => Part(obj.builtObject, obj.content),
      pointer: undefined
    }
  );

  return obj;
}

export function ImageBuilder() {
  let obj = Builder(
    b => {
      obj.pointer = Image(
        b.origin ?? b.name ?? "origin",
        b.x ?? 1,
        b.y ?? 1,
        b.width ?? 10,
        b.height ?? 10);
      return obj.pointer;
    }, {
      content: "##########",
      withWidth: len => obj.withProperty("width", len),
      withHeight: len => obj.withProperty("height", len),
      withContent: content => obj.withProperty("content", content),
      withOrigin: origin => obj.withProperty("origin", origin),
      withX: start => obj.withProperty("x", start),
      withY: start => obj.withProperty("x", start),
      defaultPart: () => Part(obj.builtObject, obj.content),
      pointer: undefined
    }
  );

  return obj;
}

let unique = 0;
export function LinkBuilder(type, ...endSpecs) {
  let obj = Builder(obj => {
    obj.forcePointer();
    return Link(obj.type, ...obj.ends.map(e => e.build()));
  }, {
    ends: [],
    withType: type => obj.withProperty("type", type),
    withEnd: e => obj.pushTo("ends", e),
    defaultPart: () => Part(obj.pointer, obj.builtObject)
  });

  obj.withType(type);
  if (endSpecs) {
    endSpecs.forEach(e => obj.withEnd(EndBuilder(e)));
  }

  let originalWithName = obj.withName;
  obj.withName = name => {
    originalWithName(name);
    obj.pointer = LinkPointer(name);
    return obj;
  };

  obj.forcePointer = () => {
    if (obj.pointer) { return obj.pointer; }
    obj.withName(obj.name ?? (++unique).toString());
    return obj.pointer;
  };

  return obj;
}

export function EndBuilder(endSpec) {
  function getPointer(p) {
    if (p.build) {
      let built = p.build();
      return p.pointer ?? built;
    }
    return p;
  }

  let obj = Builder(obj => [obj.name, obj.pointers.map(getPointer)], {
    pointers: [],
    withPointer: p => obj.pushTo("pointers", p),
    withName: name => obj.withProperty("name", name)
  });

  obj.endSpec = endSpec;

  if (endSpec) {
    obj.withName(endSpec[0]);
    endSpec[1].forEach(p => obj.withPointer(p.build ? p : PointerBuilder({ pointer: p })));
  }

  return obj;
}

export function PointerBuilder(builder) {
  return Builder(() => builder.pointer, {});
}

export function SequenceLinkBuilder(spans) {
  let name = "seq" + ++unique;
  let link = LinkBuilder("sequence", ["seq", spans]).withName(name);
  let metalink = LinkBuilder(definesSequenceType, ["targets", [link]], ["end", [InlinePointer("seq")]])
    .withName("metaseq"+ ++unique);
  return Builder(obj => {
    return [obj.link.build(), obj.metalink.build()];
  },
    {
      link,
      metalink
  });
}

export function MarkupBuilder() {

  let builder = LinkBuilder().withType(markupType);

  builder.endowing = (...attributeDescriptors) => {
    for (let i = 0; i < attributeDescriptors.length; i += 3) {
      builder
        .withEnd(EndBuilder().withName("attribute").withPointer(InlinePointer(attributeDescriptors[i])))
        .withEnd(EndBuilder().withName("value").withPointer(InlinePointer(attributeDescriptors[i+1])))
        .withEnd(EndBuilder().withName("inheritance").withPointer(InlinePointer(attributeDescriptors[i+2])));
    }
    return builder;
  };

  builder.pointingTo = pointer => {
    builder.withEnd(EndBuilder().withPointer(pointer));
    return builder;
  };

  builder.endowsBoxTo = target => builder.endowing("box", "true", "direct").pointingTo(target);

  return builder;
}

export function EdlBuilder(name = "foo") {
  let obj = Builder(obj => {
    // Links must be handled carefully to avoid circularities. Defer building
    // them until after the Edl is built.
    let edl = Edl(
      obj.type,
      obj.clips.map(x => { x.build(); return x.pointer; }),
      obj.links.map(x => { return x.forcePointer(); }));

    // Set the built object before building the links, to avoid circularity.
    obj.builtObject = edl;
    obj.links.forEach(link => link.build());

    return edl;
  }, {
    links: [],
    clips: [],
    isEdl: true,
    withType: type => obj.withProperty("type", type),
    withLink: link => obj.pushTo("links", link),
    withLinks: (...links) => { links.forEach(link => obj.withLink(link)); return obj; },
    withClip: clip => obj.pushTo("clips", clip),
    withClips: (...clips) => { clips.forEach(clip => obj.withClip(clip)); return obj; },
    defaultPart: () => { obj.build(); return Part(obj.pointer, obj.builtObject); },
    pointer: EdlPointer(name),
    withTarget: clip => { obj.target = clip; return obj.withClip(clip); },
    allLinkParts: function* () {
      obj.build();
      let linkParts = obj.links.map(b => b.defaultPart());
      yield* linkParts;
      for (let b of obj.clips) {
        if (b.isEdl) { yield* b.allLinkParts(); }
      }
    },
    allClipParts: function* () {
      obj.build();
      for (let b of obj.clips) {
        yield b.defaultPart();
        if (b.isEdl) { yield* b.allClipParts(); }
      }
    }
  });

  return obj;
}

export function wrap(object, pointer) {
  return Builder(() => object, { pointer });
}

export function SequenceBuilder(prototype, members) {
  return wrap(Sequence(prototype, members));
}

function partsForEdl(edlBuilder) {
  let edl = edlBuilder.build();
  let linkParts = edlBuilder.links.map(link => Part(link.pointer, link.build()));
  let childParts = edlBuilder.clips.filter(c => c.isEdl).map(partsForEdl);
  return linkParts.concat(...childParts).concat([Part(edlBuilder.pointer, edl)]);
}

export function DocModelBuilderBuilder(edlBuilder) {
  let obj = Builder(obj => {
    let edlParts = partsForEdl(edlBuilder);
    obj.defaultLinks.forEach(d => d.build());
    let defaultParts = obj.defaultLinks.map(link => Part(link.pointer, link.build()));
    obj.pointer = edlBuilder.pointer;
    let b = docModelBuilderTesting.makeMockedBuilderFromParts(
      obj.pointer,
      defaultParts.concat(edlParts).concat([Part(defaultsPointer, obj.defaultsEdl.build())]));
    return b;
  }, {
    defaultLinks: [],
    links: [],
    edl: edlBuilder,
    target: edlBuilder.target,
    linkCount: 1,
    defaultsEdl: EdlBuilder(defaultsPointer.edlName),
    withDefault: link => {
      obj.defaultsEdl.withLink(link);
      return obj.pushTo("defaultLinks", link);;
    },
    withDefaults: (...links) => { links.map(l => obj.withDefault(l)); return obj; },
    withLink: link => {
      if (!link) {
        throw "withLink called on EdlBuilder with null argument";
      }
      edlBuilder.withLink(link);
      return obj.pushTo("links", link);
    },
    withLinks: (...links) => { links.map(l => obj.withLink(l)); return obj; },
    withMarkupLink: (target, endName, attr, val, inherit) => {
      return obj.withLink(MarkupBuilder().withName("X-"+ obj.linkCount++)
        .endowing(attr, val, inherit)
        .withEnd(EndBuilder([endName, [target]])));
    },
    withMarkupLinkPointingToTarget: (attr, val, inherit) =>
      obj.withMarkupLinkPointingTo(obj.target, attr, val, inherit),
    withMarkupLinkPointingTo: (target, attr, val, inherit) =>
      obj.withMarkupLink(target, "targets", attr, val, inherit),
    withMarkupLinkOnSpans: (attr, val, inherit) =>
      obj.withMarkupLink(InlinePointer("span"), "clip types", attr, val, inherit),
    withMarkupLinkOnClips: (type, attr, val, inherit) =>
      obj.withMarkupLink(InlinePointer(type), "clip types", attr, val, inherit),
    withMarkupLinkOnEdls: (type, attr, val, inherit) =>
      obj.withMarkupLink(InlinePointer(type), "edl types", attr, val, inherit),
    withMarkupLinkOnLinks: (type, attr, val, inherit) =>
      obj.withMarkupLink(InlinePointer(type), "link types", attr, val, inherit),
    withSequenceLink: spanBuilders => {
      let links = SequenceLinkBuilder(spanBuilders);
      return obj.withLinks(links.link, links.metalink);
    },
    withBoxSequenceLink: spanBuilders => {
      let links = SequenceLinkBuilder(spanBuilders);
      let markup = MarkupBuilder().endowsBoxTo(links.link);
      return obj.withLinks(links.link, links.metalink, markup);
    },
    onEdl: callback => {
      callback(edlBuilder);
      return obj;
    }
  });

  return obj;
}