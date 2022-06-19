import { it, describe, expect } from '@jest/globals';
import { EdlBuilder, EdlZettelBuilder, LinkBuilder, SpanBuilder } from '../builders';
import { groupMetalinkType } from '../model';
import { InlinePointer } from '../pointers';

describe('groupletBuilders', () => {
  it ('return undefined if there are no metalinks', () => {
    let span = SpanBuilder();
    let edlZ = EdlZettelBuilder(EdlBuilder().withClip(span).withLink(LinkBuilder(undefined, [undefined, [span]]).withName("target"))).build();
    expect(edlZ.children[0].renderPointers.allPointers[0].groupletBuilders()).toHaveLength(0);
  });

  it ('return a grouplet builder if there is a group metalink that matches the endset', () => {
    let span = SpanBuilder();
    let target = LinkBuilder(undefined, ["grouping end", [span]]).withName("target");
    let edlZ = EdlZettelBuilder(EdlBuilder().withClip(span)
      .withLink(target)
      .withLink(LinkBuilder(groupMetalinkType, ["target", [target]], [undefined, [InlinePointer("grouping end")]]).withName("metalink"))).build();

    expect(edlZ.children[0].renderPointers.allPointers[0].groupletBuilders()).toHaveLength(1);
  });
});
