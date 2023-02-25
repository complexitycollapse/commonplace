import { it, describe, expect } from '@jest/globals';
import { aMetalink, aSpan, aTargetLink, makeEdlZ } from '../Groups/group-testing';
import { SequenceScanner2 } from './sequence-scanner2';

function content(n = 3) {
  return [...Array(n).keys()].map(x => aSpan(x));
}

function makeSequenceLink(spans, name = "target", type) {
  let link = aTargetLink(spans, { name });
  let metalink = aMetalink(link, name, type);
  return [link, metalink];
}

function scan(content, ...links){
  return SequenceScanner2(makeEdlZ(content, links.flat())).sequences();
}

function sequenceFor(sequences, linkAndMetalink) {
  return sequences.find(s => s.definingLink.pointer.denotesSame(linkAndMetalink[0].pointer));
}

describe('first level sequences', () => {
  it('returns no sequences if there were none in the EDL', () => {
    expect(scan(content(), [])).toEqual([]);
  });

  it('returns a sequence if there is one in the EDL', () => {
    let spans = content();
    expect(scan(spans, makeSequenceLink(spans))).toHaveLength(1);
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

  it('returns a sequence for each matching link/metalink combination', () => {
    let spans = content();
    // The target links are identical so both metalinks point at both targets
    expect(scan(spans, makeSequenceLink(spans), makeSequenceLink(spans))).toHaveLength(4);
  });

  it('returns a sequence for each metalink on a matching link', () => {
    let spans = content();
    let target = aTargetLink(spans);
    let metalink1 = aMetalink(target, "metalink1");
    let metalink2 = aMetalink(target, "metalink2");
    expect(scan(spans, [target, metalink1, metalink2])).toHaveLength(2);
  });

  it('returns a sequence that contains the zettel in the sequence', () => {
    let sequenceSpans = content();
    let allSpans = [aSpan(10), ...sequenceSpans, aSpan(11)];

    let sequence = scan(allSpans, makeSequenceLink(sequenceSpans))[0];
    
    let children = sequenceSpans[0].edlZ.children;
    expect(sequence.zettel[0]).toBe(children[1]);
    expect(sequence.zettel[1]).toBe(children[2]);
    expect(sequence.zettel[2]).toBe(children[3]);
  });

  it('returns a sequence that has definingLink set to the RenderLink that defines it', () => {
    let spans = content();
    let [definingLink, metalink] = makeSequenceLink(spans);

    let sequence = scan(spans, [definingLink, metalink])[0];
    
    let expectedRenderLink = spans[0].edlZ.getRenderLinkForPointer(definingLink.pointer);
    expect(sequence.definingLink).toBe(expectedRenderLink);
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
    expect(sequence.zettel[0].zettel[0].clip.denotesSame(spans[0].pointer)).toBeTruthy();
    expect(sequence.zettel[0].zettel[1].zettel[0].clip.denotesSame(spans[1].pointer)).toBeTruthy();
    expect(sequence.zettel[0].zettel[1].zettel[1].clip.denotesSame(spans[2].pointer)).toBeTruthy();
    expect(sequence.zettel[0].zettel[1].zettel[2].clip.denotesSame(spans[3].pointer)).toBeTruthy();
    expect(sequence.zettel[0].zettel[2].clip.denotesSame(spans[4].pointer)).toBeTruthy();
    expect(sequence.zettel[1].clip.denotesSame(spans[5].pointer)).toBeTruthy();
    expect(sequence.zettel[2].zettel[0].clip.denotesSame(spans[6].pointer)).toBeTruthy();
    expect(sequence.zettel[2].zettel[1].clip.denotesSame(spans[7].pointer)).toBeTruthy();
    expect(sequence.zettel[3].clip.denotesSame(spans[8].pointer)).toBeTruthy();
    expect(sequence.zettel[4].clip.denotesSame(spans[9].pointer)).toBeTruthy();
  });
});
