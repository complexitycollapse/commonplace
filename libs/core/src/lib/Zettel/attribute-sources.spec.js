import { describe, it, expect } from '@jest/globals';
import { AttributesSources } from './attribute-sources';
import { RenderPointerCollection } from './render-pointer-collection';
import { spans } from '../../testing';
import { Endset, Link } from '../model';
import { ClipTypePointer } from '../pointers';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';
import { RenderLink } from './render-link';

let target = spans.makeSpan();
let targetType = ClipTypePointer("span");
let allType = ClipTypePointer("all");

function makeLink(target) {
  return Link(undefined, Endset(undefined, [target]));
}

function bunchOfLinks(target, targetType) {
  return [
    [target, makeLink(target)],
    [target, makeLink(target)],
    [targetType, makeLink(targetType)],
    [targetType, makeLink(targetType)],
    [allType, Link(allType)],
    [allType, Link(allType)]
  ];
}

function makeEdl(parent, pointerLinkPairs) {
  return makeTestEdlAndEdlZettelFromLinks(pointerLinkPairs.map(x => x[1]), pointerLinkPairs.map(x => x[0]), parent);
}

function act(edlZ, linksInRenderPointerCollection) {
  let rpc = RenderPointerCollection(target, targetType);
  linksInRenderPointerCollection.forEach(l => rpc.tryAddAll(RenderLink(l[0], l[1], edlZ)));
  let renderPointers = rpc.allPointers();

  let as = AttributesSources(renderPointers, edlZ.edl);
  let sources = [...as.generateAttributeSources()];
  return sources;
}

describe('When there are direct pointers in the EDLs', () => {
  let innerLinks = bunchOfLinks(target, targetType);
  let parentLinks = bunchOfLinks(target, targetType);
  let grandParentLinks = bunchOfLinks(target, targetType);
  
  let grandParentEdl = makeEdl(undefined, grandParentLinks);
  let parentEdl = makeEdl(grandParentEdl, parentLinks);
  let edl = makeEdl(parentEdl, innerLinks);

  let [specificLink1, specificLink2, spanLink1, spanLink2, allLink1, allLink2] = innerLinks;
  let [specificLink1Parent, specificLink2Parent, spanLink1Parent, spanLink2Parent, allLink1Parent, allLink2Parent] = parentLinks;
  let [specificLink1GrandParent, specificLink2GrandParent, spanLink1GrandParent, spanLink2GrandParent, allLink1GrandParent, allLink2GrandParent] = grandParentLinks;

  it('no sources are returned if no links are passed in', () => {
    expect(act(edl, [])).toEqual([]);
  });
});
