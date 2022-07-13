import { InlinePointer } from "@commonplace/core";
import { EdlBuilder, EdlZettelBuilder, EndBuilder, LinkBuilder, SpanBuilder } from "../builders";
import { sequenceMetalinkType } from '../Model/render-link';

export function aSpan(n = 1, length = 10) { return SpanBuilder().withOrigin(n.toString()).withLength(length); }

export function aTargetLink(spans, { endName = "grouping end", name = "target" } = {}) {
  return LinkBuilder(undefined, [endName, spans]).withName(name);
}

export function aMetalink(target, name = "metalink", type) {
  let builder = LinkBuilder(sequenceMetalinkType, ["target", [target]], [undefined, [InlinePointer("grouping end")]]).withName(name);
  if (type !== undefined) { builder.withEnd(EndBuilder(["type", [InlinePointer(type)]])); }
  return builder;
}

export function makeEdlZ(content, links) {
  let edl = EdlBuilder().withClips(...content).withLinks(...links);
  let edlZ = EdlZettelBuilder(edl).build();
  content.forEach(x => x.edlZ = edlZ);
  return edlZ;
}

export function makeEdlzAndReturnSequnceDetails(content, links) {
  let edlZ = makeEdlZ(content, links);
  return edlZ.children[0].renderPointers.allPointers[0].sequenceDetails();
}
