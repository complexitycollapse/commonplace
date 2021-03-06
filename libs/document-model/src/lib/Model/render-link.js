import { addProperties, finalObject, mergeMaps } from "@commonplace/utils";
import { RenderEnd } from "./render-end";
import { RenderPointer } from "./render-pointer";
import { MetaEndowment } from "../Attributes/meta-endowment";
import { SequenceMetalink } from "../Groups/sequence-metalink";
import { AddPointerTargetFeatures } from "./pointer-target";

export const directMetalinkType = "endows direct attributes";
export const contentMetalinkType = "endows content attributes";
export const sequenceMetalinkType = "defines sequence";

export function RenderLink(pointer, link, homeEdl) {
  let type = link.type;
  if (type === directMetalinkType) { return DirectMetalink(pointer, link, homeEdl); }
  else if (type === contentMetalinkType) { return ContentMetalink(pointer, link, homeEdl); }
  else if (type === sequenceMetalinkType) { return SequenceMetalink(pointer, link, homeEdl); }
  else { return BaseRenderLink(pointer, link, homeEdl); }
}

export function BaseRenderLink(
  pointer,
  link,
  homeEdl,
  {
    directMetaEndowments = () => { return new Map(); },
    contentMetaEndowments = () => { return new Map(); },
    metaSequenceDetailsFor = () => undefined
  } = {}) {
  let obj = {};

  let modifiers = AddPointerTargetFeatures(obj, pointer, () => link, homeEdl, homeEdl);
  modifiers.addDefaults(homeEdl.defaults);

  addProperties(obj, {
    pointer,
    link,
    ends: link.ends,
    type: link.type,
    renderEnds: link.ends.map(e => RenderEnd(e, obj))
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

  function allDirectAttributeEndowments(renderPointer) {
    return mergeAllMetaAttributes(
      renderPointer,
      modifiers,
      p => p.allDirectAttributeMetaEndowments());
  }

  function allContentAttributeEndowments(renderPointer) {
    return mergeAllMetaAttributes(
      renderPointer,
      modifiers,
      p => p.allContentAttributeMetaEndowments(),
      p => p.allContentAttributeEndowments());
  }

  return finalObject(obj, {
    outstandingRequests,
    allDirectAttributeEndowments,
    allContentAttributeEndowments,
    allDirectAttributeMetaEndowments: renderPointer => directMetaEndowments(renderPointer),
    allContentAttributeMetaEndowments: renderPointer => contentMetaEndowments(renderPointer),
    getHomeEdl: () => homeEdl,
    forEachPointer,
    getRenderEnd,
    createRenderPointer,
    sequenceDetailsEndowments: renderEnd => modifiers.allPointers
      .map(m => m.metaSequenceDetailsFor(renderEnd))
      .filter(x => x !== undefined),
    metaSequenceDetailsFor
  });
}

function DirectMetalink(pointer, link, homeEdl) {
  function directMetaEndowments(renderPointer) {
    return extractMetaEndowments(renderPointer);
  }

  let obj = BaseRenderLink(pointer, link, homeEdl, { directMetaEndowments });

  return obj;
}

function ContentMetalink(pointer, link, homeEdl) {
  function contentMetaEndowments(renderPointer) {
    return extractMetaEndowments(renderPointer);
  }

  let obj = BaseRenderLink(pointer, link, homeEdl, { contentMetaEndowments });

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

function mergeAllMetaAttributes(renderPointer, modifiers, metaEndowmentFn, recursiveFn) {
  let metaAttributes = new Map();

  function merge(p) {
    if (p.pointerType !== "end" || p.endName === undefined || p.endName === renderPointer.renderEnd.name) {
      let metaEndowmentsToMerge = metaEndowmentFn(p);
      metaEndowmentsToMerge.forEach(m => {
          let [present, value] = m.calculateValueForPointer(renderPointer);
          if (present) { metaAttributes.set(m.attributeName, value); }
        });
    }
  }

  modifiers.allDefaults.forEach(merge);
  if (recursiveFn) {
    modifiers.renderPointers().forEach(p => mergeMaps(metaAttributes, recursiveFn(p)));
  }
  modifiers.renderPointers().forEach(merge);

  return metaAttributes;
}
