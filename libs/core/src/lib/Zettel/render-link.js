import { LinkTypePointer } from "../pointers";
import { addProperties, finalObject, mergeObjects } from "../utils";
import { RenderPointerCollection } from "./render-pointer-collection";

let typeMap = {
  paragraph: [null, "p"],
  italic: [{italic: true}],
  bold: [{bold: true}],
  title: [null, "h1"],
  underline: [{underline: true}],
  "strike through": [{"line-through": true}],
  capitalize: [{textTransform: "capitalize"}],
  uppercase: [{textTransform: "uppercase"}],
  lowercase: [{textTransform: "lowercase"}],
  "left aligned text": [{textAlign: "left"}],
  "right aligned text": [{textAlign: "right"}],
  "centre aligned text": [{textAlign: "center"}],
  "justified text": [{textAlign: "justify"}]
};

export function RenderLink(pointer, link, homeEdl) {
  let type = link.type;
  if (type === directMetalinkType) { return DirectMetalink(pointer, link, homeEdl); }
  else if (type === contentMetalinkType) { return ContentMetalink(pointer, link, homeEdl); }
  else { return BaseRenderLink(pointer, link, homeEdl); }
}

function BaseRenderLink(pointer, link, homeEdl, directMetaEndowments, contentMetaEndowments) {
  let renderLink = {};
  let [inlineStyle, fragmentTag] = typeMap[link.type] ?? [null, null];
  inlineStyle = inlineStyle ?? {};

  addProperties(renderLink, {
    fragmentTag,
    pointer,
    link,
    endsets: link.endsets,
    type: link.type,
    linkedContent: link.endsets.map(e => e.pointers.filter(p => p.isClip).map(p => [p, e, undefined])).flat(),
    modifiers: RenderPointerCollection(
      homeEdl.nameLinkPairs.find(e => e[1] === link)[0],
      LinkTypePointer(link.type),
      homeEdl)
  });

  function style() {
    let mod = renderLink.modifiers.renderPointers().map(p => p.renderLink).find(l => l.style());
    return mod ? mod.style() : inlineStyle;
  }

  function resolveContent(part) {
    let entry = renderLink.linkedContent.find(x => x[0].denotesSame(part.pointer));
    entry[2] = part.content;
  }

  function getContentForPointer(pointer, endset) {
    let entry = renderLink.linkedContent.find(x => x[0] === pointer && x[1] === endset);
    return entry ? entry[2] : undefined;
  }

  function outstandingRequests() {
    return renderLink.linkedContent.filter(x => !x[2]).map(x => [x[0], resolveContent]);
  }

  return finalObject(renderLink, {
    style,
    outstandingRequests,
    getContentForPointer,
    allDirectAttributeEndowments: renderPointer => mergeAllMetaAttributes(renderPointer, renderLink.modifiers, p => p.allDirectAttributeMetaEndowments()),
    allContentAttributeEndowments: renderPointer => mergeAllMetaAttributes(renderPointer, renderLink.modifiers, p => p.allContentAttributeMetaEndowments()),
    allDirectAttributeMetaEndowments: renderPointer => directMetaEndowments(renderPointer, renderLink.linkedContent) ?? (() => { return {}; }),
    allContentAttributeMetaEndowments: renderPointer => contentMetaEndowments(renderPointer, renderLink.linkedContent) ?? (() => { return {}; }),
    getHomeEdl: () => homeEdl,
    resolveContent
  });
}

const directMetalinkType = "endows direct attributes";
const contentMetalinkType = "endows content attributes";

function DirectMetalink(linkName, link, homeEdl) {
  function allDirectAttributeMetaEndowments(renderPointer, linkedContent) {
    return extractEndowments(link, renderPointer, linkedContent);
  }

  let obj = BaseRenderLink(linkName, link, homeEdl, allDirectAttributeMetaEndowments);

  return obj;
}

function ContentMetalink(linkName, link, homeEdl) {
  function allContentAttributeMetaEndowments(renderPointer, linkedContent) {
    return extractEndowments(link, renderPointer, linkedContent);
  }

  let obj = BaseRenderLink(linkName, link, homeEdl, undefined, allContentAttributeMetaEndowments);

  return obj;
}

function extractEndowments(link, renderPointer, linkedContent) {
  if (renderPointer.renderEndset.endset.type !== undefined) {
    return {};
  }

  let endowments = {};

  for(let i = 0; i < link.endsets.length - 1; ++i) {
    if (link.endsets[i].type === "attribute" && link.endsets[i+1].type === "value") {
      let attribute = findContent(linkedContent, link.Endsets[i]);
      let value = findContent(linkedContent, link.Endsets[i+1]);
      endowments[attribute] = value;
    }
  }

  return endowments;
}

function findContent(linkedContent, endset) {
  return linkedContent.find(x => x[1] === endset)[2];
}

function mergeAllMetaAttributes(renderPointer, modifiers, extractFn) {
  let metaAttributes = {};

  modifiers.renderPointers().forEach(p => {
    if (p.pointerType !== "endset" || p.endsetName === undefined || p.endsetName === renderPointer.renderEndset.name)
    {
      mergeObjects(metaAttributes, extractFn(p));
    }
  });

  return metaAttributes;
}
