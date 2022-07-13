import { it, describe, expect } from '@jest/globals';
import { LinkPointer } from '@commonplace/core';
import { aMetalink, aSpan, aTargetLink, makeEdlzAndReturnSequnceDetails } from './group-testing';

const make = makeEdlzAndReturnSequnceDetails;

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
