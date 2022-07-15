import { it, describe, expect } from '@jest/globals';
import { SequenceBuildingCursor } from './sequence-building-cursor';
import { aMetalink, anEdl, aSpan, aTargetLink, makeEdlzAndReturnSequnceDetails } from './group-testing';

function make(content, links) {
  let sequenceDetailsEndowments = makeEdlzAndReturnSequnceDetails(content, links);
  return sequenceDetailsEndowments.map(d => SequenceBuildingCursor(d.type, d.end, d.link, d.signature));
}

function consumeZettel(groupletBuilder, clipBuilder) {
  clipBuilder.build();
  let clip = clipBuilder.pointer;
  let zettel = clipBuilder.edlZ.children.find(z => z.clip.denotesSame(clip));
  return groupletBuilder.consumeZettel(zettel);
}

describe('consumeZettel', () => {
  it('returns true if clip matches the first pointer in the endset (Span case)', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);

    expect(consumeZettel(make([span1, span2], [target, aMetalink(target)])[0], span1)).toBe(true);
  });

  it('returns true if clip matches the first pointer in the endset (EDL case)', () => {
    let edl1 = anEdl("edl1"), span2 = aSpan(2);
    let target = aTargetLink([edl1, span2]);

    expect(consumeZettel(make([edl1, span2], [target, aMetalink(target)])[0], edl1)).toBe(true);
  });

  it('returns false if clip does not match the first pointer in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1]);

    expect(consumeZettel(make([span1, span2], [target, aMetalink(target)])[0], span2)).toBe(false);
  });

  it('returns false if clip does not match the first pointer in the endset (EDL case)', () => {
    let edl1 = anEdl("edl1"), edl2 = anEdl("end2"), span2 = aSpan(2);
    let target = aTargetLink([edl1, span2, edl2]);

    expect(consumeZettel(make([edl1, span2, edl2], [target, aMetalink(target)])[0], edl2)).toBe(false);
  });

  it('returns false if clip matches second, not first, pointer in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);

    expect(consumeZettel(make([span1, span2], [target, aMetalink(target)])[0], span2)).toBe(false);
  });

  it('returns false on the second call if the second pointer does not match the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2), span3 = aSpan(3);
    let target = aTargetLink([span1, span2]);

    let cursor = make([span1, span2, span3], [target, aMetalink(target)])[0];
    
    expect(consumeZettel(cursor, span1)).toBe(true);
    expect(consumeZettel(cursor, span3)).toBe(false);
  });

  it('returns true on the second call if the second pointer matches the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);

    let cursor = make([span1, span2], [target, aMetalink(target)])[0];
    
    expect(consumeZettel(cursor, span1)).toBe(true);
    expect(consumeZettel(cursor, span2)).toBe(true);
  });

  it('returns true if clip matches the beginning of the first pointer in the end', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
    let target = aTargetLink([wholeSpan]);

    expect(consumeZettel(make([prefix], [target, aMetalink(target)])[0], prefix)).toBe(true);
  });

  it('returns false if clip matches the beginning of the first pointer but not the second', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20), nextSpan = aSpan(2);
    let target = aTargetLink([wholeSpan, nextSpan]);
    let cursor = make([prefix, wholeSpan, nextSpan], [target, aMetalink(target)])[0];

    expect(consumeZettel(cursor, prefix)).toBe(true);
    expect(consumeZettel(cursor, nextSpan)).toBe(false);
  });

  it('returns true if clip matches the beginning of the first pointer and then the rest of the first pointer', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
    let remaining = aSpan(1, 10).withStart(prefix.build().next);
    let target = aTargetLink([wholeSpan]);
    let cursor = make([prefix, remaining, wholeSpan], [target, aMetalink(target)])[0];

    expect(consumeZettel(cursor, prefix)).toBe(true);
    expect(consumeZettel(cursor, remaining)).toBe(true);
  });
});

describe('isComplete', () => {
  it('returns false if consumeZettel has not been called', () => {
    let span = aSpan();
    let target = aTargetLink([span]);

    expect(make([span], [target, aMetalink(target)])[0].isComplete()).toBe(false);
  });

  it('returns false if consumeZettel did not match the first pointer', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1]);
    let cursor = make([span1, span2], [target, aMetalink(target)])[0];

    consumeZettel(cursor, span2);
    
    expect(cursor.isComplete()).toBe(false);
  });

  it('returns true if consumeZettel matched the only pointer in the end', () => {
    let span = aSpan();
    let target = aTargetLink([span]);
    let cursor = make([span], [target, aMetalink(target)])[0];

    consumeZettel(cursor, span);

    expect(cursor.isComplete()).toBe(true);
  });

  it('returns false if consumeZettel matched the first pointer but there is still another in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);
    let cursor = make([span1, span2], [target, aMetalink(target)])[0];

    consumeZettel(cursor, span1);

    expect(cursor.isComplete()).toBe(false);
  });

  it('returns false if consumeZettel matched only the beginning of the span', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
    let target = aTargetLink([wholeSpan]);
    let cursor = make([prefix], [target, aMetalink(target)])[0];

    consumeZettel(cursor, prefix);

    expect(cursor.isComplete()).toBe(false);
  });

  it('returns true if consumeZettel matched all pointers in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);
    let cursor = make([span1, span2], [target, aMetalink(target)])[0];

    consumeZettel(cursor, span1);
    consumeZettel(cursor, span2);

    expect(cursor.isComplete()).toBe(true);
  });
});

describe('pushSequence', () => {
  it('throws an exception if the sequence is not complete', () => {
    let span = aSpan();
    let target = aTargetLink([span]);

    expect(() => make([span], [target, aMetalink(target)])[0].pushSequence()).toThrow();
  });

  it('does not throw if the sequence is complete', () => {
    let span = aSpan();
    let target = aTargetLink([span]);
    let cursor = make([span], [target, aMetalink(target)])[0];

    consumeZettel(cursor, span);

    expect(() => cursor.pushSequence()).not.toThrow();
  });

  it('pushes the sequence on the sequences properties of the zettel in the sequence', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);
    let cursor = make([span1, span2], [target, aMetalink(target)])[0];
    consumeZettel(cursor, span1);
    consumeZettel(cursor, span2);

    cursor.pushSequence();

    expect(span1.edlZ.children[0].sequences).toHaveLength(1);
    expect(span2.edlZ.children[1].sequences).toHaveLength(1);
  });
});