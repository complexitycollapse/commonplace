import { describe, expect, it, test } from '@jest/globals';
import { Rule } from './rule';
import { docModelBuilderTesting } from './document-model-builder';
import { LinkPointer, Link, Span, Edl } from '@commonplace/core';
import { DocumentModelLink } from './document-model-link';

const makeLink = DocumentModelLink;
const addIncoming = docModelBuilderTesting.addIncomingPointers;

function make({originLink, immediateTargets = [], linkTypes = [], clipTypes = [], edlTypes = [], attributeDescriptors = []} = {}) {
  return Rule(originLink ?? link("origin"), immediateTargets, linkTypes, clipTypes, edlTypes, attributeDescriptors);
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

test('attributrDescriptors set in constructor',  () => {
  let expectedAttributeDescriptors = [["attr1", "val1", "direct"]];
  let rule = make({attributeDescriptors: expectedAttributeDescriptors});

  expect(rule.attributeDescriptors).toEqual(expectedAttributeDescriptors);
});

describe('Rule.match', () => {
  it('returns true if there is a direct pointer to the target',  () => {
    let target = link("link1");
    let rule = make({immediateTargets: [LinkPointer("link1")]});

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns false if there is NO direct pointer to the target',  () => {
    let target = link("link1");
    let rule = make({immediateTargets: [LinkPointer("other link")]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns true if the target is a link and has the specified link type',  () => {
    let target = link("link1");
    let rule = make({linkTypes: ["link1"]});

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns false if the target is a link but does not have the specified link type',  () => {
    let target = link("link1");
    let rule = make({linkTypes: ["other type"]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns true if the target is a clip and has the specified pointer type',  () => {
    let target = Span("origin", 1, 10);
    let rule = make({clipTypes: ["span"]});

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns false if the target is a clip but does not have the specified pointer type',  () => {
    let target = Span("origin", 1, 10);
    let rule = make({clipTypes: ["image"]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns true if the target is an EDL and has the specified EDL type',  () => {
    let target = Edl("edl1", [], []);
    let rule = make({edlTypes: ["edl1"]});

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns false if the target is an EDL but it does NOT have the specified EDL type',  () => {
    let target = Edl("edl1", [], []);
    let rule = make({edlTypes: ["other EDL type"]});

    expect(rule.match(target)).toBeFalsy();
  });
});
