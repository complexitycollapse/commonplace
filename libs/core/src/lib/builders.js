import { contentMetalinkType, directMetalinkType, Edl, Endset, Link } from "./model";
import { Part } from "./part";
import { EdlPointer, InlinePointer, LinkPointer, LinkTypePointer, PointerTypePointer, Span } from "./pointers";
import { EdlZettel } from "./zettel";

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
      defaultPart: () => Part(obj.builtObject, obj.content)
    }
  );

  return obj;
}

export function LinkBuilder() {
  let unique = 0;

  let obj = Builder(obj => Link(obj.type, ...obj.endsets.map(e => e.build())), {
    endsets: [],
    withType: type => obj.withProperty("type", type),
    withEndset: e => obj.pushTo("endsets", e),
    withName: name => obj.withProperty("pointer", LinkPointer(name ?? (++unique).toString())),
    defaultPart: () => Part(obj.pointer, obj.builtObject)
    });

  return obj;
}

export function EndsetBuilder() {
  function getPointer(p) {
    if (p.build) {
      let built = p.build();
      return p.pointer ?? built;
    } else if (typeof p === "string") {
      return LinkTypePointer(p);
    }
    return p;
  }

  let obj = Builder(obj => Endset(obj.name, obj.pointers.map(getPointer)), {
    pointers: [],
    withPointer: p => obj.pushTo("pointers", p),
    withName: name => obj.withProperty("name", name)
  });

  return obj;
}

export function PointerTypePointerBuilder(pointerType) {
  function getPointerType(obj) {
    if (obj.pointerType.pointer) { return obj.pointerType.pointer.pointerType; }
    else if (obj.pointerType.build) { obj.PointerType.build(); return obj.pointerType.pointer.pointerType; }
    else { return obj.pointerType; }
  }
  return Builder(obj => PointerTypePointer(getPointerType(obj)), { pointerType });
}

export function PointerBuilder(builder) {
  return Builder(() => builder.pointer, {});
}

export function MetalinkBuilder(directOrContent) {
  let builder = LinkBuilder().withType(directOrContent === "direct" ? directMetalinkType : contentMetalinkType);

  builder.endowing = (...attributePairs) => {
    for (let i = 0; i < attributePairs.length; i += 2) {
      builder
        .withEndset(EndsetBuilder().withName("attribute").withPointer(InlinePointer(attributePairs[i])))
        .withEndset(EndsetBuilder().withName("value").withPointer(InlinePointer(attributePairs[i+1])));
    }
    return builder;
  };

  builder.pointingTo = pointer => {
    builder.withEndset(EndsetBuilder().withPointer(pointer));
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
    return EdlZettel(
      obj.edl.pointer, undefined, undefined, "1", edl, undefined, [...obj.edl.allLinkParts(), ...obj.edl.allClipParts()]);
  }, {
    edl,
    withLinks: (...links) => { edl.withLinks(...links); return obj; }
  });

  return obj;
}
