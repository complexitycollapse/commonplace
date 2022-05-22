import { describe, it, expect } from '@jest/globals';
import { RenderPointerCollection } from './render-pointer-collection';
import { spans } from '../../testing';
import { Endset, Link } from '../model';
import { PointerTypePointer, EdlPointer, LinkPointer, LinkTypePointer } from '../pointers';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';
import { RenderLink } from './render-link';

let targetPointer = LinkPointer("target");
let targetSubject = Link("target link type");
let targetLinkType = LinkTypePointer(targetSubject.type);
let allLinkTypes = PointerTypePointer("link");

function hasLinks(actualSource, ...expected) {
  let actualLinks = actualSource.pointers.map(rp => rp.renderLink.link);
  let expectedLinks = expected.map(x => x[1]);
  expect(actualLinks).toEqual(expectedLinks);
}

function hasEdlAndLinks(actualSource, expectedEdl, ...expectedLinks) {
  expect(actualSource.edl).toEqual(expectedEdl);
  hasLinks(actualSource, ...expectedLinks);
}

function makeLink(target, type) {
  return Link(type.toString(), Endset(undefined, [target]));
}

let linkCounter = 1;

function bunchOfLinks(target, targetType) {
  return [
    [LinkPointer(`foo ${++linkCounter}`), makeLink(target, linkCounter)],
    [LinkPointer(`foo ${++linkCounter}`), makeLink(target, linkCounter)],
    [LinkPointer(`foo ${++linkCounter}`), makeLink(targetType, linkCounter)],
    [LinkPointer(`foo ${++linkCounter}`), makeLink(targetType, linkCounter)],
    [LinkPointer(`foo ${++linkCounter}`), makeLink(allLinkTypes, linkCounter)],
    [LinkPointer(`foo ${++linkCounter}`), makeLink(allLinkTypes, linkCounter)]
  ];
}

function makeEdl(parent, pointerLinkPairs, name) {
  let edlZ = makeTestEdlAndEdlZettelFromLinks(
    pointerLinkPairs.map(x => x[1]),
    pointerLinkPairs.map(x => x[0]),
    parent,
    EdlPointer(name));

  pointerLinkPairs.forEach(p => p.push(edlZ));
  
  return edlZ;
}

function getStack(edlZ, linksInRenderPointerCollection) {
  let rpc = RenderPointerCollection(targetPointer, targetSubject, edlZ);
  let renderLinks = linksInRenderPointerCollection.map(l => RenderLink(l[0], l[1], l[2]));
  rpc.tryAddAll(renderLinks);
  let sources = [...rpc.pointerStack()];
  return sources;
}

describe('pointerStack', () => {
  let innerLinks = bunchOfLinks(targetPointer, targetLinkType);
  let parentLinks = bunchOfLinks(targetPointer, targetLinkType);
  let grandParentLinks = bunchOfLinks(targetPointer, targetLinkType);
  
  let grandParentEdl = makeEdl(undefined, grandParentLinks, "inner");
  let parentEdl = makeEdl(grandParentEdl, parentLinks, "parent");
  let innerEdl = makeEdl(parentEdl, innerLinks, "grand parent");

  let [specificLink1, specificLink2, typeLink1, typeLink2, allLink1, allLink2] = innerLinks;
  let [specificLink1Parent, specificLink2Parent, typeLink1Parent, typeLink2Parent, allLink1Parent, allLink2Parent] = parentLinks;
  let [specificLink1GrandParent, specificLink2GrandParent, typeLink1GrandParent, typeLink2GrandParent, allLink1GrandParent, allLink2GrandParent] = grandParentLinks;

  it('returns no sources if no links are passed in', () => {
    expect(getStack(innerEdl, [])).toEqual([]);
  });

  it('returns a source if a link is passed in', () => {
    expect(getStack(innerEdl, [specificLink1]).length).toBe(1);
  });

  it('returns the link (as a RenderPointer) in the source', () => {
    let source = getStack(innerEdl, [specificLink1])[0];
    hasLinks(source, specificLink1);
  });

  it('returns links in the same EDL in the REVERSE order of the original EDL, not the RPC order', () => {
    let source = getStack(innerEdl, [specificLink1, specificLink2])[0];
    hasLinks(source, specificLink2, specificLink1);
  });

  it('returns the EDL that the link was present in', () => {
    expect(getStack(innerEdl, [specificLink1])[0].edl).toBe(innerEdl);
    expect(getStack(innerEdl, [specificLink1Parent])[0].edl).toBe(parentEdl);
    expect(getStack(innerEdl, [specificLink1GrandParent])[0].edl).toBe(grandParentEdl);
  });

  it('returns each link in a source with its home EDL', () => {
    let sources = getStack(innerEdl, [specificLink1, specificLink1Parent, specificLink1GrandParent]);
    hasLinks(sources.find(s => s.edl == innerEdl), specificLink1);
    hasLinks(sources.find(s => s.edl == parentEdl), specificLink1Parent);
    hasLinks(sources.find(s => s.edl == grandParentEdl), specificLink1GrandParent);
  });

  it('returns sources with child EDLs before their parents', () => {
    let sources = getStack(innerEdl, [specificLink1, specificLink1Parent, specificLink1GrandParent]);
    expect(sources[0].edl).toBe(innerEdl);
    expect(sources[1].edl).toBe(parentEdl);
    expect(sources[2].edl).toBe(grandParentEdl);
  });

  it('separates links of different pointer specifities into different sources', () => {
    let sources = getStack(innerEdl, [specificLink1, typeLink1, allLink1]);
    expect(sources.length).toBe(3);
  });

  it('returns more specific link sources before less specific ones', () => {
    let sources = getStack(innerEdl, [specificLink1, allLink1, typeLink1]);

    hasLinks(sources[0], specificLink1);
    hasLinks(sources[1], typeLink1);
    hasLinks(sources[2], allLink1);
  });

  it('returns multiple sources for an EDL if there are links of different specificity', () => {
    let sources = getStack(innerEdl, [specificLink1, allLink1, typeLink1]);

    expect(sources.map(s => s.edl)).toEqual([innerEdl, innerEdl, innerEdl]);
  });

  it('sorts sources by specificity THEN EDL hierarchy', () => {
    let sources = getStack(innerEdl, [allLink1Parent, typeLink1Parent, specificLink1, typeLink1, allLink1, specificLink1Parent]);

    hasEdlAndLinks(sources[0], innerEdl, specificLink1);
    hasEdlAndLinks(sources[1], parentEdl, specificLink1Parent);
    hasEdlAndLinks(sources[2], innerEdl, typeLink1);
    hasEdlAndLinks(sources[3], parentEdl, typeLink1Parent);
    hasEdlAndLinks(sources[4], innerEdl, allLink1);
    hasEdlAndLinks(sources[5], parentEdl, allLink1Parent);
  });

  it('sorts sources by specificity THEN EDL hierarchy and then puts the links in reverse EDL order in each source', () => {
    let sources = getStack(innerEdl, [
      specificLink1, specificLink2, typeLink1, typeLink2, allLink1, allLink2,
      specificLink1Parent, specificLink2Parent, typeLink1Parent, typeLink2Parent, allLink1Parent, allLink2Parent,
      specificLink1GrandParent, specificLink2GrandParent, typeLink1GrandParent, typeLink2GrandParent, allLink1GrandParent, allLink2GrandParent
    ]);

    hasLinks(sources[0], specificLink2, specificLink1);
    hasLinks(sources[1], specificLink2Parent, specificLink1Parent);
    hasLinks(sources[2], specificLink2GrandParent, specificLink1GrandParent);
    hasLinks(sources[3], typeLink2, typeLink1);
    hasLinks(sources[4], typeLink2Parent, typeLink1Parent);
    hasLinks(sources[5], typeLink2GrandParent, typeLink1GrandParent);
    hasLinks(sources[6], allLink2, allLink1);
    hasLinks(sources[7], allLink2Parent, allLink1Parent);
    hasLinks(sources[8], allLink2GrandParent, allLink1GrandParent);
  });
});

// function make(ownerName, ownerType) {
//   return RenderPointerCollection(LinkPointer(ownerName), LinkTypePointer(ownerType));
// }

// test('getting an attribute value from an empty collection returns undefined', () => {
//   expect(make("name", "type").attributes().key).toBe(undefined);
// });

// test('if a link pointer has been added, attributes should retrieve the attributes', () => {
//   let pointer = mockLinkRenderPointer("name", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(pointer);

//   expect(rpc.attributes().attr).toBe("expected value");
// });

// test('if a link pointer has been added, tryAddRenderPointer returns true', () => {
//   let pointer = mockLinkRenderPointer("name", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   expect(rpc.tryAddRenderPointer(pointer)).toBeTruthy();
// });

// test('if a link pointer is not for this collection, its attributes should not be added', () => {
//   let pointer = mockLinkRenderPointer("wrong name", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(pointer);

//   expect(rpc.attributes().attr).toBe(undefined);
// });

// test('if a link pointer is not for this collection, tryAddRenderPointer returns false', () => {
//   let pointer = mockLinkRenderPointer("wrong name", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   expect(rpc.tryAddRenderPointer(pointer)).toBeFalsy();
// });

// test('if a link type pointer has been added, attributes should retrieve the attributes', () => {
//   let pointer = mockLinkTypeRenderPointer("type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(pointer);

//   expect(rpc.attributes().attr).toBe("expected value");
// });

// test('if a link type pointer has been added, tryAddRenderPointer returns true', () => {
//   let pointer = mockLinkTypeRenderPointer("type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   expect(rpc.tryAddRenderPointer(pointer)).toBeTruthy();
// });

// test('if a link type pointer is not for this collection type, its attributes should not be added', () => {
//   let pointer = mockLinkTypeRenderPointer("wrong type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(pointer);

//   expect(rpc.attributes().attr).toBe(undefined);
// });

// test('if a link type pointer is not for this collection, tryAddRenderPointer returns false', () => {
//   let pointer = mockLinkTypeRenderPointer("wrong type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   expect(rpc.tryAddRenderPointer(pointer)).toBeFalsy();
// });

// test('if both a link and link type pointer have the attribute, return the link pointer value', () => {
//   let linkPointer = mockLinkRenderPointer("name", {attr: "expected value"});
//   let typePointer = mockLinkTypeRenderPointer("type", {attr: "hidden value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(linkPointer);
//   rpc.tryAddRenderPointer(typePointer);

//   expect(rpc.attributes().attr).toBe("expected value");
// });

// test('if a link type pointer has the attribute value but no link pointer does, return the link type value', () => {
//   let linkPointer = mockLinkRenderPointer("name", {otherAttr: "ignored value"});
//   let typePointer = mockLinkTypeRenderPointer("type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(linkPointer);
//   rpc.tryAddRenderPointer(typePointer);

//   expect(rpc.attributes().attr).toBe("expected value");
// });

// test('if no link or link type pointers have the requested attribute, return undefined', () => {
//   let linkPointer = mockLinkRenderPointer("name", {otherAttr: "ignored value"});
//   let typePointer = mockLinkTypeRenderPointer("type", {otherAttr: "ignored value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(linkPointer);
//   rpc.tryAddRenderPointer(typePointer);

//   expect(rpc.attributes().attr).toBe(undefined);
// });

// test('if there are two link pointers with the attribute, the value of the second one to be added takes precedence', () => {
//   let linkPointer1 = mockLinkRenderPointer("name", {attr: "ignored value"});
//   let linkPointer2 = mockLinkRenderPointer("name", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(linkPointer1);
//   rpc.tryAddRenderPointer(linkPointer2);

//   expect(rpc.attributes().attr).toBe("expected value");
// });


// test('if there are two link type pointers with the attribute, the value of the second one to be added takes precedence', () => {
//   let typePointer1 = mockLinkTypeRenderPointer("type", {attr: "ignored value"});
//   let typePointer2 = mockLinkTypeRenderPointer("type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(typePointer1);
//   rpc.tryAddRenderPointer(typePointer2);

//   expect(rpc.attributes().attr).toBe("expected value");
// });

// test('attributes returns all attributes, preferring direct values to type values and later values to earlier', () => {
//   let linkPointer1 = mockLinkRenderPointer("name", {key1: "ignored value"});
//   let linkPointer2 = mockLinkRenderPointer("name", {key1: "key1 value"});
//   let linkPointer3 = mockLinkRenderPointer("name", {key2: "key2 value"});
//   let linkTypePointer1 = mockLinkTypeRenderPointer("type", {key2: "ignored value"});
//   let linkTypePointer2 = mockLinkTypeRenderPointer("type", {key3: "ignored value"});
//   let linkTypePointer3 = mockLinkTypeRenderPointer("type", {key3: "key3 value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(linkPointer1);
//   rpc.tryAddRenderPointer(linkPointer2);
//   rpc.tryAddRenderPointer(linkPointer3);
//   rpc.tryAddRenderPointer(linkTypePointer1);
//   rpc.tryAddRenderPointer(linkTypePointer2);
//   rpc.tryAddRenderPointer(linkTypePointer3);

//   expect(rpc.attributes()).toEqual({
//     key1: "key1 value",
//     key2: "key2 value",
//     key3: "key3 value"
//   });
// });
