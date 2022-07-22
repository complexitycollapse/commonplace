import { describe, it, expect } from '@jest/globals';
import { RenderPointerCollection } from './render-pointer-collection';
import { Link } from '@commonplace/core';
import { EdlPointer, LinkPointer } from '@commonplace/core';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';
import { RenderLink } from './render-link';

let targetPointer = LinkPointer("target");
let targetSubject = Link("target link type");

function hasLinks(actualSource, ...expected) {
  let actualLinks = actualSource.pointers.map(rp => rp.renderLink.link);
  let expectedLinks = expected.map(x => x[1]);
  expect(actualLinks).toEqual(expectedLinks);
}

function makeLink(target, type) {
  return Link(type.toString(), [undefined, [target]]);
}

let linkCounter = 1;

function bunchOfLinks(target) {
  return [
    [LinkPointer(`foo ${++linkCounter}`), makeLink(target, linkCounter)],
    [LinkPointer(`foo ${++linkCounter}`), makeLink(target, linkCounter)]
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
  let rpc = RenderPointerCollection(targetPointer, () => targetSubject, edlZ);
  let renderLinks = linksInRenderPointerCollection.map(l => RenderLink(l[0], l[1], l[2]));
  rpc.allAllEdlRenderLinks(renderLinks);
  let edlAndPointersStack = [...rpc.edlAndPointersStack()];
  return edlAndPointersStack;
}

describe('edlAndPointersStack', () => {
  let innerLinks = bunchOfLinks(targetPointer);
  let parentLinks = bunchOfLinks(targetPointer);
  let grandParentLinks = bunchOfLinks(targetPointer);
  
  let grandParentEdl = makeEdl(undefined, grandParentLinks, "inner");
  let parentEdl = makeEdl(grandParentEdl, parentLinks, "parent");
  let innerEdl = makeEdl(parentEdl, innerLinks, "grand parent");

  let [specificLink1, specificLink2] = innerLinks;
  let [specificLink1Parent, specificLink2Parent] = parentLinks;
  let [specificLink1GrandParent, specificLink2GrandParent] = grandParentLinks;

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

// function make(ownerName, ownerType) {
//   return RenderPointerCollection(LinkPointer(ownerName), Link(ownerType));
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
});
