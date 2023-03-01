import { it, describe, expect } from '@jest/globals';
import { aMetalink, aSpan, aTargetLink, scan, content, makeSequenceLink, sequenceFor } from '../Groups/group-testing';

describe('first level sequences', () => {
  it('returns no sequences if there were none in the EDL', () => {
    expect(scan(content(), [])).toEqual([]);
  });

  it('returns a sequence if there is one in the EDL', () => {
    let spans = content();
    expect(scan(spans, makeSequenceLink(spans))).toHaveLength(1);
  });

  it('returns no sequences for an empty sequence', () => {
    let spans = content();
    expect(scan(spans, makeSequenceLink([]))).toHaveLength(0);
  });

  it('returns a sequence even when other spans are not part of the sequence', () => {
    let sequenceSpans = content();
    let allSpans = [aSpan(10), ...sequenceSpans, aSpan(11)];

    expect(scan(allSpans, makeSequenceLink(sequenceSpans))).toHaveLength(1);
  });

  it('does not return the sequence if it is not completed', () => {
    let spans = content();
    expect(scan(spans.slice(0, 2), makeSequenceLink(spans))).toHaveLength(0);
  });

  it('returns a sequence for each matching link', () => {
    let spans = content();
    expect(scan(spans, makeSequenceLink(spans, "target1"), makeSequenceLink(spans, "target2"))).toHaveLength(2);
  });

  it('returns a sequence for each metalink on a matching link', () => {
    let spans = content();
    let target = aTargetLink(spans);
    let metalink1 = aMetalink(target, "metalink1");
    let metalink2 = aMetalink(target, "metalink2");
    expect(scan(spans, [target, metalink1, metalink2])).toHaveLength(2);
  });

  it('returns a sequence whose members correspond to the matched sequence items', () => {
    let sequenceSpans = content(3);
    let allSpans = [aSpan(10), ...sequenceSpans, aSpan(11)];

    let sequence = scan(allSpans, makeSequenceLink(sequenceSpans))[0];
    
    expect(sequence.members).toHaveLength(3);
    expect(sequence.members[0].clip).toEqual(sequenceSpans[0].builtObject);
    expect(sequence.members[1].clip).toEqual(sequenceSpans[1].builtObject);
    expect(sequence.members[2].clip).toEqual(sequenceSpans[2].builtObject);
  });

  it('returns a sequence that has definingLink set to the link that defines it', () => {
    let spans = content();
    let [definingLink, metalink] = makeSequenceLink(spans);

    let sequence = scan(spans, [definingLink, metalink])[0];
    
    expect(sequence.definingLink).toMatchObject(definingLink.builtObject);
  });

  it('returns a sequence that has the type specified by the metapointer', () => {
    let spans = content();

    let sequence = scan(spans, makeSequenceLink(spans, "target", "expected type"))[0];
    
    expect(sequence.type).toBe("expected type");
  });
});

describe('second level sequences', () => {
  it('returns the first and second level sequences', () => {
    let spans = content();
    let childSequence = makeSequenceLink(spans, "child");
    let parentSequence = makeSequenceLink([childSequence[0]], "parent");
    expect(scan(spans, childSequence, parentSequence)).toHaveLength(2);
  });

  it('places the first level sequence inside the second level sequence', () => {
    let spans = content();
    let childSequence = makeSequenceLink(spans, "child");
    let parentSequence = makeSequenceLink([childSequence[0]], "parent");
    
    let sequences = scan(spans, childSequence, parentSequence);
    let sequence = sequenceFor(sequences, parentSequence);

    expect(sequence).toBeTruthy();
  });

  it('places the second level sequence inside the third level sequence', () => {
    let spans = content();
    let childSequence = makeSequenceLink(spans, "child");
    let parentSequence = makeSequenceLink([childSequence[0]], "parent");
    let grandparentSequence = makeSequenceLink([parentSequence[0]], "grandparent");
    
    let sequences = scan(spans, childSequence, parentSequence, grandparentSequence);
    let sequence = sequenceFor(sequences, grandparentSequence);

    expect(sequence).toBeTruthy();
  });

  it('can handle both zettel and nested sequences in the same sequence', () => {
    let spans = content(5);
    let childSequence = makeSequenceLink(spans.slice(1, 4), "child");
    let parentSequence = makeSequenceLink([spans[0], childSequence[0], spans[4]], "parent");
    
    let sequences = scan(spans, childSequence, parentSequence);
    let sequence = sequenceFor(sequences, parentSequence);

    expect(sequence).toBeTruthy();
  });

  it('can handle both zettel and nested sequences to two levels in the same sequence and has all the right elements', () => {
    let spans = content(10);
    let childSequence = makeSequenceLink(spans.slice(1, 4), "child");
    let parentSequence1 = makeSequenceLink([spans[0], childSequence[0], spans[4]], "parent1");
    let parentSequence2 = makeSequenceLink([spans[6], spans[7]], "parent2");
    let grandparentSequence = makeSequenceLink([parentSequence1[0], spans[5], parentSequence2[0], spans[8], spans[9]], "grandparent");
    
    let sequences = scan(spans, childSequence, parentSequence1, parentSequence2, grandparentSequence);
    let sequence = sequenceFor(sequences, grandparentSequence);

    expect(sequence).toBeTruthy();
    expect(sequence.members[0].members[0].clip.denotesSame(spans[0].pointer)).toBeTruthy();
    expect(sequence.members[0].members[1].members[0].clip.denotesSame(spans[1].pointer)).toBeTruthy();
    expect(sequence.members[0].members[1].members[1].clip.denotesSame(spans[2].pointer)).toBeTruthy();
    expect(sequence.members[0].members[1].members[2].clip.denotesSame(spans[3].pointer)).toBeTruthy();
    expect(sequence.members[0].members[2].clip.denotesSame(spans[4].pointer)).toBeTruthy();
    expect(sequence.members[1].clip.denotesSame(spans[5].pointer)).toBeTruthy();
    expect(sequence.members[2].members[0].clip.denotesSame(spans[6].pointer)).toBeTruthy();
    expect(sequence.members[2].members[1].clip.denotesSame(spans[7].pointer)).toBeTruthy();
    expect(sequence.members[3].clip.denotesSame(spans[8].pointer)).toBeTruthy();
    expect(sequence.members[4].clip.denotesSame(spans[9].pointer)).toBeTruthy();
  });

  it('constructs a parent sequence containing the nested child, not any other sequence created by the child link', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequence = makeSequenceLink([span1], "child");
    let parentSequence = makeSequenceLink([childSequence[0], span2]);

    // The child sequence matches in two places but only one of them is part of the parent sequence.
    // So there are 3 sequences in total.
    let sequences = scan([span1, span1, span2], childSequence, parentSequence);

    expect(sequences).toHaveLength(3);
  });
});
