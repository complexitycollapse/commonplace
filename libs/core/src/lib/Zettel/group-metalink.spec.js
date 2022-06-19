import { it, describe, expect } from '@jest/globals';
import { EdlBuilder, EdlZettelBuilder, LinkBuilder, SpanBuilder } from '../builders';
import { groupMetalinkType } from '../model';
import { InlinePointer, LinkPointer } from '../pointers';

function aSpan() { return SpanBuilder(); }

function aTargetLink(spans, { endName = "grouping end", name = "target" } = {}) {
  return LinkBuilder(undefined, [endName, spans]).withName(name);
}

function aMetalink(target) {
  return LinkBuilder(groupMetalinkType, ["target", [target]], [undefined, [InlinePointer("grouping end")]]).withName("metalink");
}

function make(content, links) {
  let edl = EdlBuilder();
  content.forEach(c => edl.withClip(c));
  links.forEach(l => edl.withLink(l));
  let edlZ = EdlZettelBuilder(edl).build();
  return edlZ.children[0].renderPointers.allPointers[0].groupletBuilders();
}

describe('groupletBuilders', () => {
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
