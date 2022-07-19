import { it, describe, expect } from '@jest/globals';
import { aMetalink, aSpan, aTargetLink, makeEdlZ } from './group-testing';
import { SequenceScanner } from './sequence-scanner';

function content() {
  return [aSpan(1), aSpan(2), aSpan(3)];
}

function makeSequenceLink(spans, name = "target", type) {
  let link = aTargetLink(spans, { name });
  let metalink = aMetalink(link, name, type);
  return [link, metalink];
}

function scan(content, ...links){
  return SequenceScanner(makeEdlZ(content, links.flat())).sequences();
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
