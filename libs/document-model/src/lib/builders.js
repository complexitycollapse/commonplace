import { contentMetalinkType, directMetalinkType } from "./Model/render-link";
import { Part, Edl, Link } from "@commonplace/core";
import { EdlPointer, InlinePointer, LinkPointer, Span } from "@commonplace/core";
import { EdlZettel } from "./Model/edl-zettel";

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
    build() {
      if (obj.builtObject === undefined) {
        obj.builtObject = buildFn(obj);
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
      obj.pointer = Span(b.origin ?? "origin", b.start ?? 1, b.length ?? 10);
      return obj.pointer;
    }, {
      content: "##########",
      withLength: len => obj.withProperty("length", len),
      withContent: content => obj.withProperty("content", content),
      withOrigin: origin => obj.withProperty("origin", origin),
      withStart: start => obj.withProperty("start", start),
      defaultPart: () => Part(obj.builtObject, obj.content)
    }
  );

  return obj;
}

export function LinkBuilder(type, ...endSpecs) {
  let unique = 0;

  let obj = Builder(obj => Link(obj.type, ...obj.ends.map(e => e.build())), {
    ends: [],
    withType: type => obj.withProperty("type", type),
    withEnd: e => obj.pushTo("ends", e),
    withName: name => obj.withProperty("pointer", LinkPointer(name ?? (++unique).toString())),
    defaultPart: () => Part(obj.pointer, obj.builtObject)
    });

    obj.withType(type);
    if (endSpecs) {
      endSpecs.forEach(e => obj.withEnd(EndBuilder(e)));
    }

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

  if (endSpec) {
    obj.withName(endSpec[0]);
    endSpec[1].forEach(p => obj.withPointer(p.build ? p : PointerBuilder({ pointer: p })));
  }

  return obj;
}

export function PointerBuilder(builder) {
  return Builder(() => builder.pointer, {});
}

export function MetalinkBuilder(directOrContent) {
  let builder = LinkBuilder().withType(directOrContent === "direct" ? directMetalinkType : contentMetalinkType);

  builder.endowing = (...attributePairs) => {
    for (let i = 0; i < attributePairs.length; i += 2) {
      builder
        .withEnd(EndBuilder().withName("attribute").withPointer(InlinePointer(attributePairs[i])))
        .withEnd(EndBuilder().withName("value").withPointer(InlinePointer(attributePairs[i+1])));
    }
    return builder;
  };

  builder.pointingTo = pointer => {
    builder.withEnd(EndBuilder().withPointer(pointer));
    return builder;
  };
  
  return builder;
}

export function EdlBuilder(name = "foo") {
  let obj = Builder(obj => {
    obj.links.map(x => x.build());
    let edl = Edl(obj.type, obj.clips.map(x => {x.build(); return x.pointer;}), obj.links.map(x => x.pointer));
    return edl;
  }, {
    links: [],
    clips: [],
    isEdl: true,
    withLink: link => obj.pushTo("links", link),
    withLinks: (...links) => { links.forEach(link => obj.withLink(link)); return obj; },
    withClip: clip => obj.pushTo("clips", clip),
    defaultPart: () => { obj.build(); return Part(obj.pointer, obj.builtObject); },
    pointer: EdlPointer(name),
    withTarget: clip => { obj.target = clip; return obj.withClip(clip); },
    allLinkParts: function* () {
      obj.build();
      yield* obj.links.map(b => b.defaultPart());
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

export function EdlZettelBuilder(edl) {
  let obj = Builder(obj => {
    let edl = obj.edl.build();
    let defaultEdl = EdlBuilder("defaults").withLinks(...obj.defaults);
    let defaultLinks = obj.defaults.map(d => d.build());
    let defaultEdlZ = EdlZettel(defaultEdl.pointer, undefined, [], "1", defaultEdl.build(), defaultLinks, []);
    return EdlZettel(
      obj.edl.pointer, undefined, defaultEdlZ.renderLinks, "1", edl, undefined, [...obj.edl.allLinkParts(), ...obj.edl.allClipParts()]);
  }, {
    edl,
    defaults: [],
    withLinks: (...links) => { edl.withLinks(...links); return obj; },
    withDefaults: (...links) => { links.forEach(link => obj.pushTo("defaults", link)); return obj; }
  });

  return obj;
}
