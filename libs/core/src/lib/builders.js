import { directMetalinkType, Edl, Endset, Link } from "./model";
import { Part } from "./part";
import { EdlPointer, InlinePointer, LinkPointer, LinkTypePointer, Span } from "./pointers";
import { EdlZettel } from "./zettel";

function Builder(buildFn, extensions) {
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
    b => Span(b.origin ?? "origin", b.start ?? 1, b.length ?? 10), {
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
    withName: name => obj.withProperty("pointer", LinkPointer(name ?? (++unique).toString()))
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

export function DirectMetalinkBuilder() {
  let builder = LinkBuilder().withType(directMetalinkType);

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

export function EdlBuilder() {
  let obj = Builder(obj => {
    obj.links = obj.linkBuilders.map(x => x.build());
    let edl = Edl(obj.type, obj.clips.map(x => x.build()), obj.linkBuilders.map(x => x.pointer));
    return edl;
  }, {
    linkBuilders: [],
    clips: [],
    withLink: link => obj.pushTo("linkBuilders", link),
    withLinks: (...links) => { links.forEach(link => obj.withLink(link)); return obj; },
    withClip: pointer => obj.pushTo("clips", pointer),
    defaultPart: () => Part(EdlPointer("this", obj.build()))
  });

  return obj;
}

export function EdlZettelBuilder(edl) {
  let obj = Builder(obj => {
    edl.build();
    return EdlZettel(
      EdlPointer("foo"), obj.parent?.build(), "1", edl.builtObject, edl.links, edl.clips.map(c => c.defaultPart()));
  }, {
    withParent: parent => obj.withProperty("parent", parent),
    withLinks: (...links) => { edl.withLinks(...links); return obj; }
  });

  obj.edl = edl;

  return obj;
}
