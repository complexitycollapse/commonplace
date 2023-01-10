import { describe, expect, it, test } from '@jest/globals';
import { Rule } from './rule';
import { docModelBuilderTesting } from './document-model-builder';
import { LinkPointer, Link, Span, Edl } from '@commonplace/core';

const makeLink = docModelBuilderTesting.LinkWithIncommingPointers;
const addIncoming = docModelBuilderTesting.addIncomingPointers;
const expectedResult = [["attr1", "val1"]];

function make({originLink, immediateTargets = [], linkTypes = [], clipTypes = [], edlTypes = []} = {}) {
  return Rule(originLink ?? link("origin"), immediateTargets, linkTypes, clipTypes, edlTypes, expectedResult);
}

function link(name, incomingPointers = []) {
  let l = makeLink(Link(name), 0, LinkPointer(name), 0);
  addIncoming(l, incomingPointers);
  return l;
}

test('originLink set in constructor',  () => {
  let originLink = link("link1");
  let rule = make({originLink});

  expect(rule.originLink).toBe(originLink);
});

describe('Rule.match', () => {
  it('returns the attributes if there is a direct pointer to the target',  () => {
    let target = link("link1");
    let rule = make({immediateTargets: [LinkPointer("link1")]});

    expect(rule.match(target)).toBe(expectedResult);
  });

  it('returns NO attributes if there is NO direct pointer to the target',  () => {
    let target = link("link1");
    let rule = make({immediateTargets: [LinkPointer("other link")]});

    expect(rule.match(target)).toEqual([]);
  });

  it('returns the attributes if the target is a link and has the specified link type',  () => {
    let target = link("link1");
    let rule = make({linkTypes: ["link1"]});

    expect(rule.match(target)).toBe(expectedResult);
  });

  it('returns NO attributes if the target is a link but does not have the specified link type',  () => {
    let target = link("link1");
    let rule = make({linkTypes: ["other type"]});

    expect(rule.match(target)).toEqual([]);
  });

  it('returns the attributes if the target is a clip and has the specified pointer type',  () => {
    let target = Span("origin", 1, 10);
    let rule = make({clipTypes: ["span"]});

    expect(rule.match(target)).toBe(expectedResult);
  });

  it('returns NO attributes if the target is a clip but does not have the specified pointer type',  () => {
    let target = Span("origin", 1, 10);
    let rule = make({clipTypes: ["box"]});

    expect(rule.match(target)).toEqual([]);
  });

  it('returns the attributes if the target is an EDL and has the specified EDL type',  () => {
    let target = Edl("edl1", [], []);
    let rule = make({edlTypes: ["edl1"]});

    expect(rule.match(target)).toBe(expectedResult);
  });

  it('returns NO attributes if the target is an EDL but it does NOT have the specified EDL type',  () => {
    let target = Edl("edl1", [], []);
    let rule = make({edlTypes: ["other EDL type"]});

    expect(rule.match(target)).toEqual([]);
  });
});
