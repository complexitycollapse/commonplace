import { it, describe, expect } from '@jest/globals';
import { aSpan, buildMockedEdlModel, makeSequenceLink, } from '../Groups/group-testing';

describe('rootSequences', () => {
  it ("returns only root sequences", () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let sequence1 = makeSequenceLink([span1], "short1");
    let sequence2 = makeSequenceLink([span2], "short2");
    let sequence3 = makeSequenceLink([sequence1[0], sequence2[0]], "long");

    let model = buildMockedEdlModel([span1, span1, span2, span2], sequence1, sequence2, sequence3);
    let roots = model.rootSequences();
    
    expect(roots).toHaveLength(3);
  });
});
