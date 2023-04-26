import { InlinePointer, definesSequenceType } from "@commonplace/core";
import { EdlBuilder, EndBuilder, LinkBuilder, SpanBuilder } from "./test-builders";
import { SequenceScanner } from '../DocumentModel/sequence-scanner';
import { docModelBuilderTesting } from '../DocumentModel/document-model-builder';

export function aSpan(n = 1, length = 10) { return SpanBuilder().withOrigin(n.toString()).withLength(length); }

export function aTargetLink(spanBuilders, { endName, name = "target" } = {}) {
  endName = endName === undefined ? "grouping end" : endName;
  endName = endName === "" ? undefined : endName;
  spanBuilders.forEach(s => s.build());
  return LinkBuilder(undefined, [endName, spanBuilders.map(s => s.pointer)]).withName(name);
}

export function aMetalink(target, name = "metalink", type, groupingEndName) {
  groupingEndName = groupingEndName === undefined ? "grouping end" : groupingEndName;
  let builder = LinkBuilder(
    definesSequenceType,
    ["targets", [target]], ["end", [InlinePointer(groupingEndName)]])
    .withName(name);
  if (type !== undefined) { builder.withEnd(EndBuilder(["type", [type]])); }
  return builder;
}

export function anEdl(name) {
  return EdlBuilder(name);
}

export function content(n = 3) {
  return [...Array(n).keys()].map(x => aSpan(x));
}

export function makeSequenceLink(spans, name = "target", type, groupingEnd) {
  let link = aTargetLink(spans, { name, endName: groupingEnd });
  let metalink = aMetalink(link, "metalink-" + name, type, groupingEnd);
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
