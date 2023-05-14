import { Part, Edl, Link, definesSequenceType, markupType } from "@commonplace/core";
import { EdlPointer, InlinePointer, LinkPointer, Span, defaultsPointer, defaultsType } from "@commonplace/core";
import { DocumentModelBuilder } from "../DocumentModel/document-model-builder";
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
    resolvePointer: nameLookup => {
      if (obj.name === undefined) {
        obj.withName(nameLookup.get(obj));
      }
      obj.pointer = obj.getPointer(obj.name);
    },
    build(docuverse) {
      if (obj.builtObject === undefined) {
        obj.builtObject = buildFn(obj, docuverse);
        if (docuverse) { docuverse.allBuilders.push(obj); }
      }
      return obj.builtObject;
    },
    buildAndReturnPointer(docuverse) {
      obj.build(docuverse);
      return obj.getPointer();
    },
    getPart: () => Part(obj.pointer, obj.builtObject)
  };

  Object.entries(extensions).forEach(e => obj[e[0]] = e[1]);

  return obj;
}

export function SpanBuilder(span) {
  let obj = Builder(
    b => {
      return obj.getPointer();
    }, {
      content: "##########",
      withLength: len => obj.withProperty("length", len),
      withContent: content => obj.withProperty("content", content),
      withOrigin: origin => obj.withProperty("origin", origin),
      withStart: start => obj.withProperty("start", start),
      getPart: () => Part(obj.builtObject, obj.content),
      getPointer: () => Span(obj.origin ?? obj.name ?? "origin", obj.start ?? 1, obj.length ?? 10)
    }
  );

  if (span) {
    obj.withOrigin(span.origin).withStart(span.start).withLength(span.length);
  }

  return obj;
}

let unique = 0;
export function LinkBuilder(type, ...endSpecs) {
  let obj = Builder(obj => {
    let builtType = obj.type?.build ? obj.type.buildAndReturnPointer() : obj.type;
    try {
      return Link(builtType, ...obj.ends.map(([name, pointers]) => [name, pointers.map(p => p.getPointer() ?? p)]));
    } catch (e) {
      console.log(e);
    }
  }, {
    ends: [],
    withType: type => obj.withProperty("type", type),
    withEnd: e => obj.pushTo("ends", e),
    getPointer: name => {
      if (name) { obj.withName(name); }
      obj.withName(obj.name ?? (++unique).toString());
      return LinkPointer(obj.name);
    }
  });

  obj.withType(type);
  if (endSpecs) {
    endSpecs.forEach(e => obj.withEnd(e));
  }

  let originalWithName = obj.withName;
  obj.withName = name => {
    originalWithName(name);
    obj.pointer = LinkPointer(name);
    return obj;
  };

  return obj;
}

export function InlineBuilder(content) {
  let obj = Builder(() => obj.getPointer(), { getPointer: () => InlinePointer(content) });
  return obj;
}

export function SequenceLinkBuilder(spans) {
  let link = LinkBuilder("sequence", ["seq", spans]);
  let metalink = LinkBuilder(definesSequenceType, ["targets", [link]], ["end", [InlineBuilder("seq")]]);
  return Builder((obj, dv) => {
    return [obj.link.build(dv), obj.metalink.build(dv)];
  },
    {
      link,
      metalink,
      getPointer: () => undefined
  });
}

export function MarkupBuilder() {

  let builder = LinkBuilder().withType(wrap(markupType, markupType));

  builder.endowing = (...attributeDescriptors) => {
    for (let i = 0; i < attributeDescriptors.length; i += 3) {
      builder
        .withEnd(["attribute", [InlineBuilder(attributeDescriptors[i])]])
        .withEnd(["value", [InlineBuilder(attributeDescriptors[i+1])]])
        .withEnd(["inheritance", [InlineBuilder(attributeDescriptors[i+2])]]);
    }
    builder.withClasses = (...classes) => {
      return builder.withEnd(["classes", classes]);
    }
    return builder;
  };

  builder.pointingTo = pointer => {
    builder.withEnd([undefined, [pointer]]);
    return builder;
  };

  builder.endowsBoxTo = target => builder.endowing("box", "true", "direct").pointingTo(target);

  return builder;
}

export function EdlBuilder() {
  let obj = Builder((obj, dv) => {
    obj.clips.forEach(x => x.build(dv));
    obj.links.forEach(x => x.build(dv));
    let edl = Edl(
      obj.type,
      obj.clips.map(x => x.getPointer()),
      obj.links.map(x => x.getPointer()));
    return edl;
  }, {
    links: [],
    clips: [],
    isEdlBuilder: true,
    withType: type => obj.withProperty("type", type),
    withLink: link => obj.pushTo("links", link),
    withLinks: (...links) => { links.forEach(link => obj.withLink(link)); return obj; },
    withClip: clip => obj.pushTo("clips", clip),
    withClips: (...clips) => { clips.forEach(clip => obj.withClip(clip)); return obj; },
    getPointer: name => EdlPointer(name),
    withTarget: clip => { obj.target = clip; return obj.withClip(clip); }
  });

  return obj;
}

export function wrap(object, pointer) {
  return Builder(() => object, { getPointer: () => pointer });
}

export function SequenceBuilder(prototype, members) {
  return wrap(Sequence(prototype, members));
}

export function DefaultsBuilder() {
  return EdlBuilder().withName(defaultsPointer.edlName).withType(defaultsType);
}

export function DocModelBuilderBuilder(edlBuilder) {
  let obj = Builder((obj, docuverse) => {
    let b = DocumentModelBuilder(edlBuilder.pointer, docuverse.cache);
    return b;
  }, {
    links: [],
    getPointer: () => undefined,
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
        .withEnd([endName, [target]]));
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
    }
  });

  return obj;
}
