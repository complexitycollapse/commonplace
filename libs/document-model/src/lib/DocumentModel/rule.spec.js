import { describe, expect, it, test } from '@jest/globals';
import { Rule } from './rule';
import { docModelBuilderTesting } from './document-model-builder';
import { LinkPointer, Link, Span, Edl, InlinePointer } from '@commonplace/core';
import { DocumentModelLink } from './document-model-link';
import SemanticClass from './semantic-class';

const makeLink = DocumentModelLink;
const addIncoming = docModelBuilderTesting.addIncomingPointers;

function make({
  originLink,
  immediateTargets = [],
  classes = [],
  linkTypes = [],
  clipTypes = [],
  edlTypes = [],
  attributeDescriptors = [] } = {}) {
  return Rule(originLink ?? link("origin"), immediateTargets, classes, linkTypes, clipTypes, edlTypes, attributeDescriptors);
}

function link(name, incomingPointers = []) {
  let l = makeLink(Link(InlinePointer(name)), 0, LinkPointer(name), 0);
  addIncoming(l, incomingPointers);
  return l;
}

function classLink(...ends) {
  let klass = Link("class");
  let type = Link("type", [undefined, [LinkPointer("class")]]);
  let link = Link(LinkPointer("type"), ...ends);
  return { link, type, klass };
}

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
    let rule = make({linkTypes: [InlinePointer("link1")]});

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns false if the target is a link but does not have the specified link type',  () => {
    let target = link("link1");
    let rule = make({linkTypes: [InlinePointer("other type")]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns false if the target has the correct link type but not the correct class',  () => {
    let target = {
      isLink: true,
      type: InlinePointer("link1"),
      getClasses: () => [SemanticClass(LinkPointer("type"))]
    };
    let rule = make({linkTypes: [InlinePointer("link1")], classes: [LinkPointer("incorrect class")]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns false if the target has the correct class but not the correct link type', () => {
    let target = {
      isLink: true,
      type: InlinePointer("link1"),
      getClasses: () => [SemanticClass(LinkPointer("type"))]
    };
    let rule = make({linkTypes: [InlinePointer("incorrect type")], classes: [LinkPointer("type")]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns true if the target has the correct link type AND the correct class', () => {
    let target = {
      isLink: true,
      type: InlinePointer("link1"),
      getClasses: () => [SemanticClass(LinkPointer("type"))]
    };
    let rule = make({linkTypes: [InlinePointer("link1")], classes: [LinkPointer("type")]});

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns true if the target has the correct class and no link type is specified', () => {
    let target = {
      isLink: true,
      type: InlinePointer("whatever"),
      getClasses: () => [SemanticClass(LinkPointer("type"))]
    };
    let rule = make({classes: [LinkPointer("type")]});

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns true if the target is a clip and has the specified pointer type',  () => {
    let target = { isClip: true, pointer: Span("origin", 1, 10) };
    let rule = make({clipTypes: ["span"]});

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns false if the target is a clip but does not have the specified pointer type',  () => {
    let target = { isClip: true, pointer: Span("origin", 1, 10) };
    let rule = make({clipTypes: ["image"]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns true if the target is an EDL and has the specified EDL type',  () => {
    let target = Edl(InlinePointer("edl1"), [], []);
    let rule = make({edlTypes: [InlinePointer("edl1")]});

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns false if the target is an EDL but it does NOT have the specified EDL type',  () => {
    let target = Edl(InlinePointer("edl1"), [], []);
    let rule = make({edlTypes: [InlinePointer("other EDL type")]});

    expect(rule.match(target)).toBeFalsy();
  });
});

describe('hasTypeCriteria', () => {
  it('is true if the rule as a link type', () => {
    let rule = make({ linkTypes: [InlinePointer("link type")] });

    expect(rule.hasTypeCriteria).toBeTruthy();
  });

  it('is true if the rule as an Edl type', () => {
    let rule = make({ edlTypes: [InlinePointer("edl type")] });

    expect(rule.hasTypeCriteria).toBeTruthy();
  });

  it('is true if the rule as a clip type', () => {
    let rule = make({ clipTypes: [InlinePointer("span")] });

    expect(rule.hasTypeCriteria).toBeTruthy();
  });

  it('is false if the rule as no link types, edl types or clip types', () => {
    let rule = make({ classes: [SemanticClass(InlinePointer("some class"))] });

    expect(rule.hasTypeCriteria).toBeFalsy();
  });
});

describe('hasClassCriteria', () => {
  it('is true if the rule as a class criterion', () => {
    let rule = make({ classes: [SemanticClass(InlinePointer("class"))] });

    expect(rule.hasClassCriteria).toBeTruthy();
  });

  it('is false if the rule as no class criteria', () => {
    let rule = make({
      linkTypes: [InlinePointer("link types")],
      edlTypes: [InlinePointer("edl types")],
      clipTypes: [InlinePointer("span")]
    });

    expect(rule.hasClassCriteria).toBeFalsy();
  });
});
