import { InlinePointer } from "@commonplace/core";
import { EdlBuilder, EndBuilder, LinkBuilder, SpanBuilder } from "./test-builders";
import { SequenceScanner } from '../DocumentModel/sequence-scanner';
import { docModelBuilderTesting } from '../DocumentModel/document-model-builder';
import { definesSequenceType } from "../Defaults/defaults";

export function aSpan(n = 1, length = 10) { return SpanBuilder().withOrigin(n.toString()).withLength(length); }

export function aTargetLink(spanBuilders, { endName = "grouping end", name = "target" } = {}) {
  spanBuilders.forEach(s => s.build());
  return LinkBuilder(undefined, [endName, spanBuilders.map(s => s.pointer)]).withName(name);
}

export function aMetalink(target, name = "metalink", type) {
  let builder = LinkBuilder(definesSequenceType, ["targets", [target]], ["end", [InlinePointer("grouping end")]]).withName(name);
  if (type !== undefined) { builder.withEnd(EndBuilder(["type", [InlinePointer(type)]])); }
  return builder;
}

export function anEdl(name) {
  return EdlBuilder(name);
}

export function content(n = 3) {
  return [...Array(n).keys()].map(x => aSpan(x));
}

export function makeSequenceLink(spans, name = "target", type) {
  let link = aTargetLink(spans, { name });
  let metalink = aMetalink(link, "metalink-" + name, type);
  return [link, metalink];
}

export function buildMockedEdlModel(content, ...links) {
  links = links.flat()
  let docBuilder = EdlBuilder("document").withClips(...content).withLinks(...links);
  let allBuilders = [docBuilder].concat(content, links);
  let parts = allBuilders.map(b => {
    b.build();
    return b.defaultPart();
  })
  let builder = docModelBuilderTesting.makeMockedBuilderFromParts(docBuilder.pointer, parts);
  let docModel = builder.build();
  return docModel;
}

export function scan(content, ...links) {
  let docModel = buildMockedEdlModel(content, ...links);
  return SequenceScanner(docModel.zettel, Object.values(docModel.links)).sequences();
}

export function sequenceFor(sequences, linkAndMetalink) {
  return sequences.find(s => s.definingLink.pointer.denotesSame(linkAndMetalink[0].pointer));
}
