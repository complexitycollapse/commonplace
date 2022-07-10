import { it, describe, expect } from '@jest/globals';
import { EdlBuilder, EdlZettelBuilder, LinkBuilder, SpanBuilder } from '../builders';
import { sequenceMetalinkType } from '../Model/render-link';
import { InlinePointer, LinkPointer } from '@commonplace/core';
import { SequenceBuilder } from './sequence-builder';

function aSpan(n = 1, length = 10) { return SpanBuilder().withOrigin(n.toString()).withLength(length); }

function aTargetLink(spans, { endName = "grouping end", name = "target" } = {}) {
  return LinkBuilder(undefined, [endName, spans]).withName(name);
}

function aMetalink(target) {
  return LinkBuilder(sequenceMetalinkType, ["target", [target]], [undefined, [InlinePointer("grouping end")]]).withName("metalink");
}

function make(content, links) {
  let edl = EdlBuilder().withClips(...content).withLinks(...links);
  let edlZ = EdlZettelBuilder(edl).build();
  content.forEach(x => x.edlZ = edlZ);
  return edlZ.children[0].renderPointers.allPointers[0].sequenceDetails().map(d => SequenceBuilder(d.type, d.end, d.signature));
}

describe('sequenceDetails', () => {
  it ('return undefined if there are no metalinks', () => {
    let span = aSpan();
    expect(make([span], [aTargetLink([span])])).toHaveLength(0);
  });

  it ('return a grouplet builder if there is a group metalink that matches the endset', () => {
    let span = aSpan();
    let target = aTargetLink([span]);

    expect(make([span], [target, aMetalink(target)])).toHaveLength(1);
  });

  it ('does not return a grouplet builder if the endset is not a grouping one', () => {
    let span = aSpan();
    let target = aTargetLink([span], { endName: "non-grouping end"});
    
    expect(make([span], [target, aMetalink(target)])).toHaveLength(0);
  });

  it ('does not return a grouplet builder if the grouping metalink does not point to the link', () => {
    let span = aSpan();
    let target = aTargetLink([span]);

    expect(make([span], [target, aMetalink(LinkPointer("not the target"))])).toHaveLength(0);
  });
});
