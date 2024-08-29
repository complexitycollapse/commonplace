import { describe, expect, it, test } from 'vitest';
import { Rule } from './rule';
import { docModelBuilderTesting } from './document-model-builder';
import { LinkPointer, Link, Span, Edl, InlinePointer } from '@commonplace/core';
import { DocumentModelLink } from './document-model-link';
import SemanticClass from './semantic-class';
import { getLevels } from '../class-mixins';

const makeLink = DocumentModelLink;
const addIncoming = docModelBuilderTesting.addIncomingPointers;

function make({
  originLink,
  namedTargets = [],
  classes = [],
  linkTypes = [],
  clipTypes = [],
  edlTypes = [],
  levels = [],
  attributeDescriptors = [] } = {}) {
  return Rule(originLink ?? link("origin"), namedTargets, classes, linkTypes, clipTypes, edlTypes, levels, attributeDescriptors);
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

describe('Rule.match specificity', () => {
  it('returns "named" if there is a direct pointer to the target',  () => {
    let target = link("link1");
    let rule = make({namedTargets: [LinkPointer("link1")]});

    expect(rule.match(target).specificity).toEqual("named");
  });

  it('returns falsy if there is NO direct pointer to the target',  () => {
    let target = link("link1");
    let rule = make({namedTargets: [LinkPointer("other link")]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns "type" if the target is a link and has the specified link type (no class specified)',  () => {
    let target = link("link1");
    let rule = make({linkTypes: [InlinePointer("link1")]});

    expect(rule.match(target).specificity).toBe("type");
  });

  it('returns falsy if the target is a link but does not have the specified link type (no class specified)',  () => {
    let target = link("link1");
    let rule = make({linkTypes: [InlinePointer("other type")]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns falsy if the target has the correct link type but not the correct class',  () => {
    let target = {
      isLink: true,
      type: InlinePointer("link1"),
      getClasses: () => [SemanticClass(LinkPointer("type"))]
    };
    let rule = make({linkTypes: [InlinePointer("link1")], classes: [LinkPointer("incorrect class")]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns falsy if the target has the correct class but not the correct link type', () => {
    let target = {
      isLink: true,
      type: InlinePointer("link1"),
      getClasses: () => [SemanticClass(LinkPointer("type"))]
    };
    let rule = make({linkTypes: [InlinePointer("incorrect type")], classes: [LinkPointer("type")]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns "class and type" if the target has the correct link type AND the correct class', () => {
    let target = {
      isLink: true,
      type: InlinePointer("link1"),
      getClasses: () => [SemanticClass(LinkPointer("type"))]
    };
    let rule = make({linkTypes: [InlinePointer("link1")], classes: [LinkPointer("type")]});

    expect(rule.match(target).specificity).toBe("class and type");
  });

  it('returns "class" if the target has the correct class and no link type is specified', () => {
    let target = {
      isLink: true,
      type: InlinePointer("whatever"),
      getClasses: () => [SemanticClass(LinkPointer("type"))]
    };
    let rule = make({classes: [LinkPointer("type")]});

    expect(rule.match(target).specificity).toBe("class");
  });

  it('returns "type" if the target is a clip and has the specified pointer type (no class specified)',  () => {
    let target = { isClip: true, pointer: Span("origin", 1, 10) };
    let rule = make({clipTypes: ["span"]});

    expect(rule.match(target).specificity).toBe("type");
  });

  it('returns falsy if the target is a clip but does not have the specified pointer type',  () => {
    let target = { isClip: true, pointer: Span("origin", 1, 10) };
    let rule = make({clipTypes: ["image"]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns "type" if the target is an EDL and has the specified EDL type (no class specified)',  () => {
    let target = Edl(InlinePointer("edl1"), [], []);
    let rule = make({edlTypes: [InlinePointer("edl1")]});

    expect(rule.match(target).specificity).toBe("type");
  });

  it('returns falsy if the target is an EDL but it does NOT have the specified EDL type',  () => {
    let target = Edl(InlinePointer("edl1"), [], []);
    let rule = make({edlTypes: [InlinePointer("other EDL type")]});

    expect(rule.match(target)).toBeFalsy();
  });
});

describe('Rule.match with levels', () => {

  function makeContainer(klass, containers = []) {
    const obj = {
      getClasses: () => [SemanticClass(LinkPointer(klass))],
      getContainers: () => containers,
      getLevels: () => getLevels.apply(obj)
    };
    return obj;
  }

  function makeTarget(...containers) {
    const obj = {
      isLink: true,
      type: InlinePointer("whatever"),
      getClasses: () => [SemanticClass(LinkPointer("type"))],
      getContainers: () => containers,
      getLevels: () => getLevels.apply(obj)
    };
    return obj;
  }

  function makeScoped(levels) {
    return make({classes: [LinkPointer("type")], levels: levels.map(l => ({classPointer: LinkPointer(l.classPointer), depth: l?.depth}))});
  }

  it('does not match the target\'s own class', () => {
    let target = {
      isLink: true,
      type: InlinePointer("whatever"),
      getClasses: () => [SemanticClass(LinkPointer("type"))],
      getContainers: () => [],
      getLevels: () => getLevels.apply(target)
    };

    let rule = make({classes: [LinkPointer("type")], levels: [{classPointer: LinkPointer("type")}]});

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns truthy if the target matches and is inside the scope', () => {
    let target = makeTarget(makeContainer("scope"));

    let rule = makeScoped([{classPointer: "scope"}]);

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns truthy if the target matches and is inside the scope, even if there are other levels between the object and the scope', () => {
    let target = makeTarget(makeContainer("different scope", [makeContainer("scope")]));

    let rule = makeScoped([{classPointer: "scope"}]);

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns falsy if the target matches but is outside the scope', () => {
    let target = makeTarget(makeContainer("scope"));

    let rule = makeScoped([{classPointer: "wrong scope"}]);

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns falsy if only one scope is matched but two are provided', () => {
    let target = makeTarget(makeContainer("scope1"));

    let rule = makeScoped([{classPointer: "scope1"}, {classPointer: "scope2"}]);

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns truthy if two scopes are provided and both match at the same level', () => {
    let target = makeTarget(makeContainer("scope1"), makeContainer("scope2"));

    let rule = makeScoped([{classPointer: "scope1"}, {classPointer: "scope2"}]);

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns truthy if two scopes are provided and they match at different levels', () => {
    let target = makeTarget(makeContainer("scope1", [makeContainer("scope2")]));

    let rule = makeScoped([{classPointer: "scope1"}, {classPointer: "scope2"}]);

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns truthy if two scopes are provided and they match at different levels even though other levels are in between', () => {
    let target = makeTarget(makeContainer("scope1", [makeContainer("different scope", [makeContainer("scope2")])]));

    let rule = makeScoped([{classPointer: "scope1"}, {classPointer: "scope2"}]);

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns falsy if a depth of 2 is required but there is only one level of nesting', () => {
    let target = makeTarget(makeContainer("scope"));

    let rule = makeScoped([{classPointer: "scope", depth: 2}]);

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns falsy if a depth of 2 is required but the required scopes are not nested', () => {
    let target = makeTarget(makeContainer("scope"), makeContainer("scope"));

    let rule = makeScoped([{classPointer: "scope", depth: 2}]);

    expect(rule.match(target)).toBeFalsy();
  });

  it('returns truthy if a depth of 2 is required and the required scope is nested to level 2', () => {
    let target = makeTarget(makeContainer("scope", [makeContainer("scope")]));

    let rule = makeScoped([{classPointer: "scope", depth: 2}]);

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns truthy if a depth of 2 is required and the required scope is nested to a greater level', () => {
    let target = makeTarget(makeContainer("scope", [makeContainer("scope", [makeContainer("scope")])]));

    let rule = makeScoped([{classPointer: "scope", depth: 2}]);

    expect(rule.match(target)).toBeTruthy();
  });

  it('returns truthy if a depth of 2 is required and the scope is nested to level 2 but with other levels in between', () => {
    let target = makeTarget(makeContainer("scope", [makeContainer("different scope", [makeContainer("scope")])]));

    let rule = makeScoped([{classPointer: "scope", depth: 2}]);

    expect(rule.match(target)).toBeTruthy();
  });

  describe("levelScopeDistance", () => {
    it('is 1 if the target is immediately contained in the scope', () => {
      let target = makeTarget(makeContainer("scope"));
  
      let rule = makeScoped([{classPointer: "scope"}]);
  
      expect(rule.match(target).levelScopeDistance).toBe(1);
    });
  
    it('is 2 if there is a level in between', () => {
      let target = makeTarget(makeContainer("different scope", [makeContainer("scope")]));
  
      let rule = makeScoped([{classPointer: "scope"}]);
  
      expect(rule.match(target).levelScopeDistance).toBe(2);
    });

    it('is the minimum if there are multiple scopes that match at different distances', () => {
      let target = makeTarget(makeContainer("different scope", [makeContainer("scope1")]), makeContainer("scope2"));
  
      let rule = makeScoped([{classPointer: "scope1"}, {classPointer: "scope2"}]);
  
      expect(rule.match(target).levelScopeDistance).toBe(1);
    });
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
