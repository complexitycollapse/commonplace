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
  let edl = EdlBuilder();
  content.forEach(c => edl.withClip(c));
  links.forEach(l => edl.withLink(l));
  let edlZ = EdlZettelBuilder(edl).build();
  content.forEach(x => x.edlZ = edlZ);
  return edlZ.children[0].renderPointers.allPointers[0].sequenceDetails().map(d => SequenceBuilder(d.type, d.end, d.signature));
}

function consumePointer(groupletBuilder, clipBuilder) {
  let clip = clipBuilder.build();
  let zettel = clipBuilder.edlZ.children.find(z => z.clip.denotesSame(clip));
  return groupletBuilder.consumePointer(zettel);
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

describe('SequenceBuilder', () => {
  describe('consumePointer', () => {
    it('returns true if clip matches the first pointer in the endset', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1, span2]);
  
      expect(consumePointer(make([span1, span2], [target, aMetalink(target)])[0], span1)).toBe(true);
    });

    it('returns false if clip does not match the first pointer in the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1]);
  
      expect(consumePointer(make([span1, span2], [target, aMetalink(target)])[0], span2)).toBe(false);
    });

    it('returns false if clip matches second, not first, pointer in the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1, span2]);
  
      expect(consumePointer(make([span1, span2], [target, aMetalink(target)])[0], span2)).toBe(false);
    });

    it('returns false on the second call if the second pointer does not match the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2), span3 = aSpan(3);
      let target = aTargetLink([span1, span2]);
  
      let builder = make([span1, span2, span3], [target, aMetalink(target)])[0];
      
      expect(consumePointer(builder, span1)).toBe(true);
      expect(consumePointer(builder, span3)).toBe(false);
    });

    it('returns true on the second call if the second pointer matches the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1, span2]);
  
      let builder = make([span1, span2], [target, aMetalink(target)])[0];
      
      expect(consumePointer(builder, span1)).toBe(true);
      expect(consumePointer(builder, span2)).toBe(true);
    });

    it('returns true if clip matches the beginning of the first pointer in the end', () => {
      let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
      let target = aTargetLink([wholeSpan]);
  
      expect(consumePointer(make([prefix], [target, aMetalink(target)])[0], prefix)).toBe(true);
    });

    it('returns false if clip matches the beginning of the first pointer but not the second', () => {
      let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20), nextSpan = aSpan(2);
      let target = aTargetLink([wholeSpan, nextSpan]);
      let builder = make([prefix, wholeSpan, nextSpan], [target, aMetalink(target)])[0];

      expect(consumePointer(builder, prefix)).toBe(true);
      expect(consumePointer(builder, nextSpan)).toBe(false);
    });

    it('returns true if clip matches the beginning of the first pointer and then the rest of the first pointer', () => {
      let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
      let remaining = aSpan(1, 10).withStart(prefix.build().next);
      let target = aTargetLink([wholeSpan]);
      let builder = make([prefix, remaining, wholeSpan], [target, aMetalink(target)])[0];

      expect(consumePointer(builder, prefix)).toBe(true);
      expect(consumePointer(builder, remaining)).toBe(true);
    });
  });

  describe('isComplete', () => {
    it('returns false if consumePointer has not been called', () => {
      let span = aSpan();
      let target = aTargetLink([span]);
  
      expect(make([span], [target, aMetalink(target)])[0].isComplete()).toBe(false);
    });

    it('returns false if consumePointer did not match the first pointer', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1]);
      let builder = make([span1, span2], [target, aMetalink(target)])[0];

      consumePointer(builder, span2);
      
      expect(builder.isComplete()).toBe(false);
    });

    it('returns true if consumePointer matched the only pointer in the end', () => {
      let span = aSpan();
      let target = aTargetLink([span]);
      let builder = make([span], [target, aMetalink(target)])[0];

      consumePointer(builder, span);
  
      expect(builder.isComplete()).toBe(true);
    });

    it('returns false if consumePointer matched the first pointer but there is still another in the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1, span2]);
      let builder = make([span1, span2], [target, aMetalink(target)])[0];

      consumePointer(builder, span1);
  
      expect(builder.isComplete()).toBe(false);
    });

    it('returns false if consumePointer matched only the beginning of the span', () => {
      let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
      let target = aTargetLink([wholeSpan]);
      let builder = make([prefix], [target, aMetalink(target)])[0];

      consumePointer(builder, prefix);

      expect(builder.isComplete()).toBe(false);
    });

    it('returns true if consumePointer matched all pointers in the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1, span2]);
      let builder = make([span1, span2], [target, aMetalink(target)])[0];

      consumePointer(builder, span1);
      consumePointer(builder, span2);
  
      expect(builder.isComplete()).toBe(true);
    });
  });
});
