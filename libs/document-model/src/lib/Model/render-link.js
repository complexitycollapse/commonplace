import { addProperties, finalObject, mergeMaps } from "@commonplace/utils";
import { RenderEnd } from "./render-end";
import { RenderPointer } from "./render-pointer";
import { MetaEndowment } from "../Attributes/meta-endowment";
import { SequenceMetalink } from "../Groups/sequence-metalink";
import { AddPointerTargetFeatures } from "./pointer-target";

export const directMetalinkType = "endows direct attributes";
export const contentMetalinkType = "endows content attributes";
export const sequenceMetalinkType = "defines sequence";

export function RenderLink(pointer, link, homeEdl, linkIndex) {
  let type = link.type;
  if (type === directMetalinkType) { return DirectMetalink(pointer, link, homeEdl, linkIndex); }
  else if (type === contentMetalinkType) { return ContentMetalink(pointer, link, homeEdl, linkIndex); }
  else if (type === sequenceMetalinkType) { return SequenceMetalink(pointer, link, homeEdl, linkIndex); }
  else { return BaseRenderLink(pointer, link, homeEdl, linkIndex); }
}

export function BaseRenderLink(
  pointer,
  link,
  homeEdl,
  linkIndex,
  {
    directMetaEndowments = () => { return new Map(); },
    contentMetaEndowments = () => { return new Map(); },
    metaSequenceDetailPrototypessFor = () => undefined
  } = {}) {
  if (linkIndex === undefined) { throw "BaseRenderLink is missing mandatory argument linkIndex"; }

  let obj = {};

  let modifiers = AddPointerTargetFeatures(obj, pointer, () => link, homeEdl);
  modifiers.addDefaults(homeEdl.defaults);

  addProperties(obj, {
    pointer,
    link,
    ends: link.ends,
    type: link.type,
    renderEnds: link.ends.map(e => RenderEnd(e, obj)),
    linkIndex,
    homeEdl
  });

  function outstandingRequests() {
    return obj.renderEnds.map(e => e.outstandingRequests()).flat();
  }

  function forEachPointer(fn) {
    link.forEachPointer((p, e) => fn(p, e, obj));
  }

  function getRenderEnd(end) {
    return obj.renderEnds.find(re => re.end.index === end.index);
  }

  function createRenderPointer(pointer, end) {
    let renderEnd = getRenderEnd(end);
    if (!renderEnd) {
      throw "End not valid for this link";
    }
    return RenderPointer(pointer, renderEnd);
  }

  function comparePriority(otherLink) {
    let edlCompare = homeEdl.depth - otherLink.homeEdl.depth;
    return edlCompare == 0 ? linkIndex - otherLink.linkIndex : edlCompare;
  }

  function allDirectAttributeEndowments(renderPointer) {
    return mergeAllMetaAttributes(
      renderPointer,
      modifiers,
      p => p.allDirectAttributeMetaEndowments(),
      false);
  }

  function allContentAttributeEndowments(renderPointer, recur) {
    return mergeAllMetaAttributes(
      renderPointer,
      modifiers,
      p => p.allContentAttributeMetaEndowments(),
      recur,
      p => p.allContentAttributeEndowments());
  }

  return finalObject(obj, {
    comparePriority,
    outstandingRequests,
    allDirectAttributeEndowments,
    allContentAttributeEndowments,
    allDirectAttributeMetaEndowments: renderPointer => directMetaEndowments(renderPointer),
    allContentAttributeMetaEndowments: renderPointer => contentMetaEndowments(renderPointer),
    getHomeEdl: () => homeEdl,
    forEachPointer,
    getRenderEnd,
    createRenderPointer,
    sequenceDetailsEndowmentPrototypes: renderEnd => modifiers.allPointers
      .map(m => m.metaSequenceDetailPrototypessFor(renderEnd))
      .filter(x => x !== undefined),
      metaSequenceDetailPrototypessFor
  });
}

function DirectMetalink(pointer, link, homeEdl, linkIndex) {
  function directMetaEndowments(renderPointer) {
    return extractMetaEndowments(renderPointer);
  }

  let obj = BaseRenderLink(pointer, link, homeEdl, linkIndex, { directMetaEndowments });

  return obj;
}

function ContentMetalink(pointer, link, homeEdl, linkIndex) {
  function contentMetaEndowments(renderPointer) {
    return extractMetaEndowments(renderPointer);
  }

  let obj = BaseRenderLink(pointer, link, homeEdl, linkIndex, { contentMetaEndowments });

  return obj;
}

function extractMetaEndowments(renderPointer) {
  let metaEndowments = [];

  // We only endow meta-endowments through the unnamed ends
  if (renderPointer.renderEnd.end.name !== undefined) {
    return metaEndowments;
  }

  let allRenderEnds = renderPointer.renderLink.renderEnds;

  function buildMetaEndowment(i, max) {
    let attribute = allRenderEnds[i].concatatext();
    let defaultValue, hasValueEnd = false, valueEndName;
    for(let j = 1; j < 2 && i + j <= max; ++j) {
      if (allRenderEnds[i+j].end.name === "value") {
        defaultValue = allRenderEnds[i+j].concatatext();
      }
      if (allRenderEnds[i+j].end.name === "value end") {
        hasValueEnd = true;
        valueEndName = allRenderEnds[i+j].concatatext();
      }
    }
        
    return MetaEndowment(attribute, defaultValue, hasValueEnd, valueEndName);
  }

  let max = allRenderEnds.length - 1;

  for (let i = 0; i < max; ++i) {
    if (allRenderEnds[i].end.name === "attribute") {
      let me = buildMetaEndowment(i, max);
      if (me) { metaEndowments.push(me); }
    }
  }

  return metaEndowments;
}

function mergeAllMetaAttributes(renderPointer, modifiers, metaEndowmentFn, shouldRecur, recursiveFn) {
  let metaAttributes = new Map();

  function merge(p) {
    let metaEndowmentsToMerge = metaEndowmentFn(p);
    metaEndowmentsToMerge.forEach(m => {
        let [present, value] = m.calculateValueForPointer(renderPointer);
        if (present) { metaAttributes.set(m.attributeName, value); }
      });
  }

  modifiers.allDefaults.forEach(merge);
  if (shouldRecur) {
    modifiers.renderPointers().forEach(p => mergeMaps(metaAttributes, recursiveFn(p)));
  }
  modifiers.renderPointers().forEach(merge);

  return metaAttributes;
}
