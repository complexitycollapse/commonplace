import { it, describe, expect, test } from '@jest/globals';
import { SequenceBuildingCursor } from './sequence-building-cursor';
import { aMetalink, anEdl, aSpan, aTargetLink, makeEdlzAndReturnSequnceDetails, makeEdlZ } from './group-testing';

function make(content, links) {
  let sequenceDetailsEndowments = makeEdlzAndReturnSequnceDetails(content, links);
  return sequenceDetailsEndowments.map(d => SequenceBuildingCursor(d))[0];
}

function consumeZettel(groupletBuilder, clipBuilder) {
  clipBuilder.build();
  let clip = clipBuilder.pointer;
  let zettel = clipBuilder.edlZ.children.find(z => z.clip.denotesSame(clip));
  return groupletBuilder.consumeZettel(zettel);
}

function getCursorForLink(edlZ, link) {
  let renderLink = edlZ.renderLinks.find(l => l.pointer.denotesSame(link.pointer));
  let sequenceDetails = renderLink.sequenceDetailsEndowments(renderLink.renderEnds.find(e => e.name === "grouping end"))[0];
  return SequenceBuildingCursor(sequenceDetails);
}

function makeCursorAndChildSequences(contents, parentSequenceLinks, childSequenceLinks) {
  let edlZ = makeEdlZ(contents, [...childSequenceLinks, ...parentSequenceLinks].map(l => [l, aMetalink(l)]).flat());
  let childSequences = [];
  childSequenceLinks.forEach(l => {
    let cursor = getCursorForLink(edlZ, l);
    contents.forEach(s => consumeZettel(cursor, s));
    childSequences.push(cursor.pushSequence());
  });
  
  let cursors = parentSequenceLinks.map(l => getCursorForLink(edlZ, l));
  return [cursors, ...childSequences];
}

describe('consumeZettel', () => {
  it('returns true if clip matches the first pointer in the endset (Span case)', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);

    expect(consumeZettel(make([span1, span2], [target, aMetalink(target)]), span1)).toBe(true);
  });

  it('returns true if clip matches the first pointer in the endset (EDL case)', () => {
    let edl1 = anEdl("edl1"), span2 = aSpan(2);
    let target = aTargetLink([edl1, span2]);

    expect(consumeZettel(make([edl1, span2], [target, aMetalink(target)]), edl1)).toBe(true);
  });

  it('returns false if clip does not match the first pointer in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1]);

    expect(consumeZettel(make([span1, span2], [target, aMetalink(target)]), span2)).toBe(false);
  });

  it('returns false if clip does not match the first pointer in the endset (EDL case)', () => {
    let edl1 = anEdl("edl1"), edl2 = anEdl("end2"), span2 = aSpan(2);
    let target = aTargetLink([edl1, span2, edl2]);

    expect(consumeZettel(make([edl1, span2, edl2], [target, aMetalink(target)]), edl2)).toBe(false);
  });

  it('returns false if clip matches second, not first, pointer in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);

    expect(consumeZettel(make([span1, span2], [target, aMetalink(target)]), span2)).toBe(false);
  });

  it('returns false on the second call if the second pointer does not match the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2), span3 = aSpan(3);
    let target = aTargetLink([span1, span2]);

    let cursor = make([span1, span2, span3], [target, aMetalink(target)]);
    
    expect(consumeZettel(cursor, span1)).toBe(true);
    expect(consumeZettel(cursor, span3)).toBe(false);
  });

  it('returns true on the second call if the second pointer matches the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);

    let cursor = make([span1, span2], [target, aMetalink(target)]);
    
    expect(consumeZettel(cursor, span1)).toBe(true);
    expect(consumeZettel(cursor, span2)).toBe(true);
  });

  it('returns true if clip matches the beginning of the first pointer in the end', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
    let target = aTargetLink([wholeSpan]);

    expect(consumeZettel(make([prefix], [target, aMetalink(target)]), prefix)).toBe(true);
  });

  it('returns false if clip matches the beginning of the first pointer but not the second', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20), nextSpan = aSpan(2);
    let target = aTargetLink([wholeSpan, nextSpan]);
    let cursor = make([prefix, wholeSpan, nextSpan], [target, aMetalink(target)]);

    expect(consumeZettel(cursor, prefix)).toBe(true);
    expect(consumeZettel(cursor, nextSpan)).toBe(false);
  });

  it('returns true if clip matches the beginning of the first pointer and then the rest of the first pointer', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
    let remaining = aSpan(1, 10).withStart(prefix.build().next);
    let target = aTargetLink([wholeSpan]);
    let cursor = make([prefix, remaining, wholeSpan], [target, aMetalink(target)]);

    expect(consumeZettel(cursor, prefix)).toBe(true);
    expect(consumeZettel(cursor, remaining)).toBe(true);
  });
});

describe('consumeSequence', () => {
  it('returns true when the required sequence matches the given one', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let [[cursor], childSequence] = makeCursorAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink]);

    expect(cursor.consumeSequence(childSequence)).toBe(true);
  });

  it('returns false when the required sequence does not match the given one', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let wrongSequenceLink = aTargetLink([span1, span2], { name: "wrong"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let [[cursor], , wrongSequence] = makeCursorAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink, wrongSequenceLink]);

    expect(cursor.consumeSequence(wrongSequence)).toBe(false);
  });

  it('will consume zettel in the child sequence once the child sequence is consumed', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let [[cursor], childSequence] = makeCursorAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink]);
    cursor.consumeSequence(childSequence)

    expect(consumeZettel(cursor, span1)).toBe(true);
    expect(consumeZettel(cursor, span2)).toBe(true);
  });

  it('will throw an return false if the zettel passed in after consuming a sequence do not match that sequence', () => {
    let span1 = aSpan(1), span2 = aSpan(2), span3 = aSpan(3);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink, span3], { name: "parent" });
    let [[cursor], childSequence] = makeCursorAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink]);
    cursor.consumeSequence(childSequence);

    expect(consumeZettel(cursor, span2)).toBe(false);
  });

  test('consumeZettel will return false if the zettel is a member of a child sequence but consumeSequence was not called first', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let [[cursor]] = makeCursorAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink]);

    expect(consumeZettel(cursor, span1)).toBe(false);
  });

  it('returns true if a second level sequence matches', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let grandparentSequenceLink = aTargetLink([parentSequenceLink], { name: "grandparent" });
    let [[parentCursor, grandparentCursor], childSequence] =
      makeCursorAndChildSequences([span1, span2], [parentSequenceLink, grandparentSequenceLink], [childSequenceLink]);
    parentCursor.consumeSequence(childSequence);
    consumeZettel(parentCursor, span1);
    consumeZettel(parentCursor, span2);
    let parentSequence = parentCursor.pushSequence();
  
    expect(grandparentCursor.consumeSequence(parentSequence)).toBe(true);
  });
});

describe('isComplete', () => {
  it('returns false if consumeZettel has not been called', () => {
    let span = aSpan();
    let target = aTargetLink([span]);

    expect(make([span], [target, aMetalink(target)]).isComplete()).toBe(false);
  });

  it('returns false if consumeZettel did not match the first pointer', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1]);
    let cursor = make([span1, span2], [target, aMetalink(target)]);

    consumeZettel(cursor, span2);
    
    expect(cursor.isComplete()).toBe(false);
  });

  it('returns true if consumeZettel matched the only pointer in the end', () => {
    let span = aSpan();
    let target = aTargetLink([span]);
    let cursor = make([span], [target, aMetalink(target)]);

    consumeZettel(cursor, span);

    expect(cursor.isComplete()).toBe(true);
  });

  it('returns false if consumeZettel matched the first pointer but there is still another in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);
    let cursor = make([span1, span2], [target, aMetalink(target)]);

    consumeZettel(cursor, span1);

    expect(cursor.isComplete()).toBe(false);
  });

  it('returns false if consumeZettel matched only the beginning of the span', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
    let target = aTargetLink([wholeSpan]);
    let cursor = make([prefix], [target, aMetalink(target)]);

    consumeZettel(cursor, prefix);

    expect(cursor.isComplete()).toBe(false);
  });

  it('returns true if consumeZettel matched all pointers in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);
    let cursor = make([span1, span2], [target, aMetalink(target)]);

    consumeZettel(cursor, span1);
    consumeZettel(cursor, span2);

    expect(cursor.isComplete()).toBe(true);
  });
});

describe('pushSequence', () => {
  it('throws an exception if the sequence is not complete', () => {
    let span = aSpan();
    let target = aTargetLink([span]);

    expect(() => make([span], [target, aMetalink(target)]).pushSequence()).toThrow();
  });

  it('does not throw if the sequence is complete', () => {
    let span = aSpan();
    let target = aTargetLink([span]);
    let cursor = make([span], [target, aMetalink(target)]);

    consumeZettel(cursor, span);

    expect(() => cursor.pushSequence()).not.toThrow();
  });

  it('pushes the sequence on the sequences properties of the zettel in the sequence', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);
    let cursor = make([span1, span2], [target, aMetalink(target)]);
    consumeZettel(cursor, span1);
    consumeZettel(cursor, span2);

    cursor.pushSequence();

    expect(span1.edlZ.children[0].sequences).toHaveLength(1);
    expect(span2.edlZ.children[1].sequences).toHaveLength(1);
  });

  it('pushes the parent sequence on the sequences properties of the child sequence links', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let [[cursor], childSequence] = makeCursorAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink]);
    cursor.consumeSequence(childSequence)
    consumeZettel(cursor, span1);
    consumeZettel(cursor, span2);

    cursor.pushSequence();

    expect(span1.edlZ.renderLinks[0].sequences).toHaveLength(1);
  });
});
