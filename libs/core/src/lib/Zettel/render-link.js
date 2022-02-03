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

export function RenderLink(link, homeEdl, { directMetaEndowments, contentMetaEndowments  } = {}) {
  let renderLink = {};
  let [inlineStyle, fragmentTag] = typeMap[link.type] ?? [null, null];
  inlineStyle = inlineStyle ?? {};

  addProperties(renderLink, {
    fragmentTag,
    link,
    endsets: link.endsets,
    type: link.type,
    linkedContent: link.endsets.map(e => e.pointers.filter(p => p.isClip).map(p => [p, e, undefined])).flat(),
    homeEdl,
    modifiers: RenderPointerCollection(homeEdl.nameLinkPairs().find(e => e[1] === link)[0])
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
  });
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
