import { addProperties, finalObject, memoize, mergeMaps } from "../utils";
import { RenderPointerCollection } from "./render-pointer-collection";
import { directMetalinkType, contentMetalinkType, groupMetalinkType } from '../model';
import { Attributes } from "./attributes";
import { RenderEnd } from "./render-end";
import { RenderPointer } from "./render-pointer";
import { MetaEndowment } from "./meta-endowment";
import { GroupMetalink } from "./group-metalink";

export function RenderLink(pointer, link, homeEdl) {
  let type = link.type;
  if (type === directMetalinkType) { return DirectMetalink(pointer, link, homeEdl); }
  else if (type === contentMetalinkType) { return ContentMetalink(pointer, link, homeEdl); }
  else if (type === groupMetalinkType) { return GroupMetalink(pointer, link, homeEdl); }
  else { return BaseRenderLink(pointer, link, homeEdl); }
}

export function BaseRenderLink(
  pointer,
  link,
  homeEdl,
  {
    directMetaEndowments = () => { return new Map(); },
    contentMetaEndowments = () => { return new Map(); },
    metaGroupletBuilderFor = () => undefined
  } = {}) {
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

  function getRenderEnd(end) {
    return renderLink.renderEnds.find(re => re.end.index === end.index);
  }

  function createRenderPointer(pointer, end) {
    let renderEnd = getRenderEnd(end);
    if (!renderEnd) {
      throw "End not valid for this link";
    }
    return RenderPointer(pointer, renderEnd);
  }

  return finalObject(renderLink, {
    outstandingRequests,
    allDirectAttributeEndowments: renderPointer => 
      mergeAllMetaAttributes(
        renderPointer,
        renderLink.modifiers,
        p => p.allDirectAttributeMetaEndowments()),
    allContentAttributeEndowments: renderPointer =>
      mergeAllMetaAttributes(
        renderPointer,
        renderLink.modifiers,
        p => p.allContentAttributeMetaEndowments(),
        p => p.allContentAttributeEndowments()),
    allDirectAttributeMetaEndowments: renderPointer => directMetaEndowments(renderPointer),
    allContentAttributeMetaEndowments: renderPointer => contentMetaEndowments(renderPointer),
    getHomeEdl: () => homeEdl,
    forEachPointer,
    getRenderEnd,
    createRenderPointer,
    groupletBuilders: renderPointer => renderLink.modifiers.allPointers.map(m => m.metaGroupletBuilderFor(renderPointer)).filter(x => x),
    metaGroupletBuilderFor
  });
}

function DirectMetalink(linkName, link, homeEdl) {
  function directMetaEndowments(renderPointer) {
    return extractMetaEndowments(renderPointer);
  }

  let obj = BaseRenderLink(linkName, link, homeEdl, { directMetaEndowments });

  return obj;
}

function ContentMetalink(linkName, link, homeEdl) {
  function contentMetaEndowments(renderPointer) {
    return extractMetaEndowments(renderPointer);
  }

  let obj = BaseRenderLink(linkName, link, homeEdl, { contentMetaEndowments });

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
