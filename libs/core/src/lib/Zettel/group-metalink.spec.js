import { it, describe, expect } from '@jest/globals';
import { EdlBuilder, EdlZettelBuilder, LinkBuilder, SpanBuilder } from '../builders';
import { groupMetalinkType } from '../model';
import { InlinePointer, LinkPointer, Span } from '../pointers';

function aSpan(n = 1, length = 10) { return SpanBuilder().withOrigin(n.toString()).withLength(length); }

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

describe('GroupletBuilder', () => {
  describe('consumePointer', () => {
    it('returns true if clip matches the first pointer in the endset', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1, span2]);
  
      expect(make([span1, span2], [target, aMetalink(target)])[0].consumePointer(span1.build())).toBe(true);
    });

    it('returns false if clip does not match the first pointer in the end', () => {
      let span = aSpan();
      let target = aTargetLink([span]);
  
      expect(make([span], [target, aMetalink(target)])[0].consumePointer(Span("not matching", 1, 1))).toBe(false);
    });

    it('returns false if clip matches second, not first, pointer in the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1, span2]);
  
      expect(make([span1, span2], [target, aMetalink(target)])[0].consumePointer(span2.build())).toBe(false);
    });

    it('returns false on the second call if the second pointer does not match the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2), span3 = aSpan(3);
      let target = aTargetLink([span1, span2]);
  
      let builder = make([span1, span2], [target, aMetalink(target)])[0];
      builder.consumePointer(span2.build());

      expect(builder.consumePointer(span3.build())).toBe(false);
    });

    it('returns true on the second call if the second pointer matches the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1, span2]);
  
      let builder = make([span1, span2], [target, aMetalink(target)])[0];
      builder.consumePointer(span2.build());

      expect(builder.consumePointer(span2.build())).toBe(false);
    });

    it('returns true if clip matches the beginning of the first pointer in the end', () => {
      let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
      let target = aTargetLink([wholeSpan]);
  
      expect(make([prefix], [target, aMetalink(target)])[0].consumePointer(prefix.build())).toBe(true);
    });

    it('returns false if clip matches the beginning of the first pointer but not the second', () => {
      let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20), nextSpan = aSpan(2);
      let target = aTargetLink([wholeSpan, nextSpan]);
      let builder = make([prefix], [target, aMetalink(target)])[0];

      builder.consumePointer(prefix.build());

      expect(builder.consumePointer(nextSpan.build())).toBe(false);
    });

    it('returns true if clip matches the beginning of the first pointer and then the rest of the first pointer', () => {
      let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
      let remaining = aSpan(1, 10).withStart(prefix.build().next);
      let target = aTargetLink([wholeSpan]);
      let builder = make([prefix], [target, aMetalink(target)])[0];

      builder.consumePointer(prefix.build());

      expect(builder.consumePointer(remaining.build())).toBe(true);
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

      builder.consumePointer(span2.build());
  
      expect(builder.isComplete()).toBe(false);
    });

    it('returns true if consumePointer matched the only pointer in the end', () => {
      let span = aSpan();
      let target = aTargetLink([span]);
      let builder = make([span], [target, aMetalink(target)])[0];

      builder.consumePointer(span.build());
  
      expect(builder.isComplete()).toBe(true);
    });

    it('returns false if consumePointer matched the first pointer but there is still another in the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1, span2]);
      let builder = make([span1, span2], [target, aMetalink(target)])[0];

      builder.consumePointer(span1.build());
  
      expect(builder.isComplete()).toBe(false);
    });

    it('returns false if consumePointer matched only the beginning of the span', () => {
      let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
      let target = aTargetLink([wholeSpan]);
      let builder = make([prefix], [target, aMetalink(target)])[0];

      builder.consumePointer(prefix.build());

      expect(builder.isComplete()).toBe(false);
    });

    it('returns true if consumePointer matched all pointers in the end', () => {
      let span1 = aSpan(1), span2 = aSpan(2);
      let target = aTargetLink([span1, span2]);
      let builder = make([span1, span2], [target, aMetalink(target)])[0];

      builder.consumePointer(span1.build());
      builder.consumePointer(span2.build());
  
      expect(builder.isComplete()).toBe(true);
    });
  });
});
