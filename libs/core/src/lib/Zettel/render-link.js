import { addProperties, finalObject, memoize, mergeMaps } from "../utils";
import { RenderPointerCollection } from "./render-pointer-collection";
import { directMetalinkType, contentMetalinkType } from '../model';
import { Attributes } from "./attributes";
import { RenderEnd } from "./render-end";
import { RenderPointer } from "./render-pointer";

export function RenderLink(pointer, link, homeEdl) {
  let type = link.type;
  if (type === directMetalinkType) { return DirectMetalink(pointer, link, homeEdl); }
  else if (type === contentMetalinkType) { return ContentMetalink(pointer, link, homeEdl); }
  else { return BaseRenderLink(pointer, link, homeEdl); }
}

function BaseRenderLink(pointer, link, homeEdl, directMetaEndowments = (() => { return new Map(); }), contentMetaEndowments = (() => { return new Map(); })) {
  let renderLink = {};

  function attributes() {
    return Attributes(renderLink, homeEdl.attributes(), renderLink.modifiers.pointerStack(), renderLink.modifiers.defaultsStack());
  }

  {
    let ownerPointer = homeEdl.nameLinkPairs.find(e => e[1] === link)[0];
    let modifiers = RenderPointerCollection(ownerPointer, link, homeEdl);
    modifiers.addDefaults(homeEdl.defaults);

    addProperties(renderLink, {
      pointer,
      link,
      ends: link.ends,
      type: link.type,
      modifiers,
      attributes: memoize(attributes),
      renderEnds: link.ends.map(e => RenderEnd(e, renderLink))
    });
  }

  function outstandingRequests() {
    return renderLink.renderEnds.map(e => e.outstandingRequests()).flat();
  }

  function forEachPointer(fn) {
    link.forEachPointer((p, e) => fn(p, e, renderLink));
  }

  function getRenderEndset(end) {
    return renderLink.renderEnds.find(re => re.end.index === end.index);
  }

  function createRenderPointer(pointer, end) {
    let renderEnd = getRenderEndset(end);
    if (!renderEnd) {
      throw "End not valid for this link";
    }
    return RenderPointer(pointer, renderEnd);
  }

  return finalObject(renderLink, {
    outstandingRequests,
    allDirectAttributeEndowments: renderPointer => 
      mergeAllMetaAttributes(renderPointer, renderLink.modifiers, p => p.allDirectAttributeMetaEndowments()),
    allContentAttributeEndowments: 
      renderPointer => mergeAllMetaAttributes(
        renderPointer,
        renderLink.modifiers,
        p => p.allContentAttributeMetaEndowments(),
        p => p.allContentAttributeEndowments()),
    allDirectAttributeMetaEndowments: renderPointer => directMetaEndowments(renderPointer),
    allContentAttributeMetaEndowments: renderPointer => contentMetaEndowments(renderPointer),
    getHomeEdl: () => homeEdl,
    forEachPointer,
    getRenderEndset,
    createRenderPointer
  });
}

function DirectMetalink(linkName, link, homeEdl) {
  function allDirectAttributeMetaEndowments(renderPointer) {
    return extractMetaEndowments(renderPointer);
  }

  let obj = BaseRenderLink(linkName, link, homeEdl, allDirectAttributeMetaEndowments);

  return obj;
}

function ContentMetalink(linkName, link, homeEdl) {
  function allContentAttributeMetaEndowments(renderPointer) {
    return extractMetaEndowments(renderPointer);
  }

  let obj = BaseRenderLink(linkName, link, homeEdl, undefined, allContentAttributeMetaEndowments);

  return obj;
}

function extractMetaEndowments(renderPointer) {
  let endowments = new Map();

  // We only endow meta-endowments through the unnamed ends
  if (renderPointer.renderEnd.end.name !== undefined) {
    return endowments;
  }

  let allRenderEndsets = renderPointer.renderLink.renderEnds;

  // TODO: the below assumes that the attribute and value ends contain a single pointer, which is why
  // they can use [0] to just grab the first (only) piece of content for the end. In reality these
  // ends should actually be endlists and the content from all pointers should be combined linearly into
  // a single string.

  for (let i = 0; i < allRenderEndsets.length - 1; ++i) {
    if (allRenderEndsets[i].end.name === "attribute" && allRenderEndsets[i+1].end.name === "value") {
      let attribute = allRenderEndsets[i].linkedContent[0][1];
      let value = allRenderEndsets[i+1].linkedContent[0][1];
      endowments.set(attribute, value);
    }
  }

  return endowments;
}

function mergeAllMetaAttributes(renderPointer, modifiers, extractFn, recursiveFn) {
  let metaAttributes = new Map();

  function merge(p) {
    if (p.pointerType !== "end" || p.endName === undefined || p.endName === renderPointer.renderEnd.name)
    {
      mergeMaps(metaAttributes, extractFn(p));
    }
  }

  modifiers.allDefaults.forEach(merge);
  if (recursiveFn) {
    modifiers.renderPointers().forEach(p => mergeMaps(metaAttributes, recursiveFn(p)));
  }
  modifiers.renderPointers().forEach(merge);

  return metaAttributes;
}
