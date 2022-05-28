import { addProperties, finalObject, mergeMaps } from "../utils";
import { RenderPointerCollection } from "./render-pointer-collection";
import { directMetalinkType, contentMetalinkType } from './model';
import { Attributes } from "./attributes";

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

function BaseRenderLink(pointer, link, homeEdl, directMetaEndowments = (() => { return new Map(); }), contentMetaEndowments = (() => { return new Map(); })) {
  let renderLink = {};
  let [inlineStyle, fragmentTag] = typeMap[link.type] ?? [null, null];
  inlineStyle = inlineStyle ?? {};
  {
    // TODO: this doesn't work at all. If the link points to an EDL or other link then they need
    // to be pursued recursively to get all content. specifiesContent is therefore a bad property.
    // For now it's just a hack that makes sure inline pointers are treated correctly.
    let linkedContent = link.endsets
          .map(e => e.pointers.filter(p => p.specifiesContent)
          .map(p => [p, e, p.inlineText])) // will be undefined except for inline pointers
          .flat();
    let ownerPointer = homeEdl.nameLinkPairs.find(e => e[1] === link)[0];
    let modifiers = RenderPointerCollection(ownerPointer, link, homeEdl);
    modifiers.addDefaults(homeEdl.defaults);

    addProperties(renderLink, {
      fragmentTag,
      pointer,
      link,
      endsets: link.endsets,
      type: link.type,
      linkedContent,
      modifiers
    });
  }

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

  function attributes() {
    return Attributes(renderLink, homeEdl.attributes(), renderLink.modifiers.pointerStack(), renderLink.modifiers.defaultsStack());
  }

  function forEachPointer(fn) {
    link.forEachPointer((p, e) => fn(p, e, renderLink));
  }

  return finalObject(renderLink, {
    style,
    outstandingRequests,
    getContentForPointer,
    allDirectAttributeEndowments: renderPointer => mergeAllMetaAttributes(renderPointer, renderLink.modifiers, p => p.allDirectAttributeMetaEndowments()),
    allContentAttributeEndowments: renderPointer => mergeAllMetaAttributes(renderPointer, renderLink.modifiers, p => p.allContentAttributeMetaEndowments()),
    allDirectAttributeMetaEndowments: renderPointer => directMetaEndowments(renderPointer, renderLink.linkedContent),
    allContentAttributeMetaEndowments: renderPointer => contentMetaEndowments(renderPointer, renderLink.linkedContent),
    getHomeEdl: () => homeEdl,
    resolveContent,
    attributes,
    forEachPointer
  });
}

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
  let endowments = new Map();

  if (renderPointer.renderEndset.endset.name !== undefined) {
    return endowments;
  }

  for(let i = 0; i < link.endsets.length - 1; ++i) {
    if (link.endsets[i].name === "attribute" && link.endsets[i+1].name === "value") {
      let attribute = findContent(linkedContent, link.endsets[i]);
      let value = findContent(linkedContent, link.endsets[i+1]);
      endowments.set(attribute, value);
    }
  }

  return endowments;
}

function findContent(linkedContent, endset) {
  return linkedContent.find(x => x[1] === endset)[2];
}

function mergeAllMetaAttributes(renderPointer, modifiers, extractFn) {
  let metaAttributes = new Map();

  modifiers.renderPointers().forEach(p => {
    if (p.pointerType !== "endset" || p.endsetName === undefined || p.endsetName === renderPointer.renderEndset.name)
    {
      mergeMaps(metaAttributes, extractFn(p));
    }
  });

  return metaAttributes;
}
