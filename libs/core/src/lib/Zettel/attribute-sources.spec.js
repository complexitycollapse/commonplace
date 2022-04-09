import { describe, it, expect } from '@jest/globals';
import { AttributesSources } from './attribute-sources';
import { RenderPointerCollection } from './render-pointer-collection';
import { spans } from '../../testing';
import { Endset, Link } from '../model';
import { ClipTypePointer, EdlPointer, LinkPointer } from '../pointers';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';
import { RenderLink } from './render-link';

let target = spans.makeSpan();
let targetType = ClipTypePointer("span");
let allType = ClipTypePointer("all");

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
    [LinkPointer("foo", ++linkCounter), makeLink(target, linkCounter)],
    [LinkPointer("foo", ++linkCounter), makeLink(target, linkCounter)],
    [LinkPointer("foo", ++linkCounter), makeLink(targetType, linkCounter)],
    [LinkPointer("foo", ++linkCounter), makeLink(targetType, linkCounter)],
    [LinkPointer("foo", ++linkCounter), makeLink(allType, linkCounter)],
    [LinkPointer("foo", ++linkCounter), makeLink(allType, linkCounter)]
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

function act(edlZ, linksInRenderPointerCollection) {
  let rpc = RenderPointerCollection(target, targetType);
  let renderLinks = linksInRenderPointerCollection.map(l => RenderLink(l[0], l[1], l[2]));
  rpc.tryAddAll(renderLinks);
  let renderPointers = rpc.allPointers();

  let as = AttributesSources(renderPointers, edlZ);
  let sources = [...as.generateAttributeSources()];
  return sources;
}

describe('When there are direct pointers in the EDLs', () => {
  let innerLinks = bunchOfLinks(target, targetType);
  let parentLinks = bunchOfLinks(target, targetType);
  let grandParentLinks = bunchOfLinks(target, targetType);
  
  let grandParentEdl = makeEdl(undefined, grandParentLinks, "inner");
  let parentEdl = makeEdl(grandParentEdl, parentLinks, "parent");
  let innerEdl = makeEdl(parentEdl, innerLinks, "grand parent");

  let [specificLink1, specificLink2, spanLink1, spanLink2, allLink1, allLink2] = innerLinks;
  let [specificLink1Parent, specificLink2Parent, spanLink1Parent, spanLink2Parent, allLink1Parent, allLink2Parent] = parentLinks;
  let [specificLink1GrandParent, specificLink2GrandParent, spanLink1GrandParent, spanLink2GrandParent, allLink1GrandParent, allLink2GrandParent] = grandParentLinks;

  it('returns no sources if no links are passed in', () => {
    expect(act(innerEdl, [])).toEqual([]);
  });

  it('returns a source if a link is passed in', () => {
    expect(act(innerEdl, [specificLink1]).length).toBe(1);
  });

  it('returns the link (as a RenderPointer) in the source', () => {
    let source = act(innerEdl, [specificLink1])[0];
    hasLinks(source, specificLink1);
  });

  it('returns links in the same EDL in the REVERSE order of the original EDL, not the RPC order', () => {
    let source = act(innerEdl, [specificLink1, specificLink2])[0];
    hasLinks(source, specificLink2, specificLink1);
  });

  it('returns the EDL that the link was present in', () => {
    expect(act(innerEdl, [specificLink1])[0].edl).toBe(innerEdl);
    expect(act(innerEdl, [specificLink1Parent])[0].edl).toBe(parentEdl);
    expect(act(innerEdl, [specificLink1GrandParent])[0].edl).toBe(grandParentEdl);
  });

  it('returns each link in a source with its home EDL', () => {
    let sources = act(innerEdl, [specificLink1, specificLink1Parent, specificLink1GrandParent]);
    hasLinks(sources.find(s => s.edl == innerEdl), specificLink1);
    hasLinks(sources.find(s => s.edl == parentEdl), specificLink1Parent);
    hasLinks(sources.find(s => s.edl == grandParentEdl), specificLink1GrandParent);
  });

  it('returns sources with child EDLs before their parents', () => {
    let sources = act(innerEdl, [specificLink1, specificLink1Parent, specificLink1GrandParent]);
    expect(sources[0].edl).toBe(innerEdl);
    expect(sources[1].edl).toBe(parentEdl);
    expect(sources[2].edl).toBe(grandParentEdl);
  });

  it('separates links of different pointer specifities into different sources', () => {
    let sources = act(innerEdl, [specificLink1, spanLink1, allLink1]);
    expect(sources.length).toBe(3);
  });

  it('returns more specific link sources before less specific ones', () => {
    let sources = act(innerEdl, [specificLink1, allLink1, spanLink1]);

    hasLinks(sources[0], specificLink1);
    hasLinks(sources[1], spanLink1);
    hasLinks(sources[2], allLink1);
  });

  it('returns multiple sources for an EDL if there are links of different specificity', () => {
    let sources = act(innerEdl, [specificLink1, allLink1, spanLink1]);

    expect(sources.map(s => s.edl)).toEqual([innerEdl, innerEdl, innerEdl]);
  });

  it('sorts sources by specificity THEN EDL hierarchy', () => {
    let sources = act(innerEdl, [allLink1Parent, spanLink1Parent, specificLink1, spanLink1, allLink1, specificLink1Parent]);

    hasEdlAndLinks(sources[0], innerEdl, specificLink1);
    hasEdlAndLinks(sources[1], parentEdl, specificLink1Parent);
    hasEdlAndLinks(sources[2], innerEdl, spanLink1);
    hasEdlAndLinks(sources[3], parentEdl, spanLink1Parent);
    hasEdlAndLinks(sources[4], innerEdl, allLink1);
    hasEdlAndLinks(sources[5], parentEdl, allLink1Parent);
  });

  it('sorts sources by specificity THEN EDL hierarchy and then puts the links in reverse EDL order in each source', () => {
    let sources = act(innerEdl, [
      specificLink1, specificLink2, spanLink1, spanLink2, allLink1, allLink2,
      specificLink1Parent, specificLink2Parent, spanLink1Parent, spanLink2Parent, allLink1Parent, allLink2Parent,
      specificLink1GrandParent, specificLink2GrandParent, spanLink1GrandParent, spanLink2GrandParent, allLink1GrandParent, allLink2GrandParent
    ]);

    hasLinks(sources[0], specificLink2, specificLink1);
    hasLinks(sources[1], specificLink2Parent, specificLink1Parent);
    hasLinks(sources[2], specificLink2GrandParent, specificLink1GrandParent);
    hasLinks(sources[3], spanLink2, spanLink1);
    hasLinks(sources[4], spanLink2Parent, spanLink1Parent);
    hasLinks(sources[5], spanLink2GrandParent, spanLink1GrandParent);
    hasLinks(sources[6], allLink2, allLink1);
    hasLinks(sources[7], allLink2Parent, allLink1Parent);
    hasLinks(sources[8], allLink2GrandParent, allLink1GrandParent);
  });
});
