import { RenderLink } from "./render-link";

export function DirectMetalink(linkName, link, homeEdl) {
  function allDirectAttributeMetaEndowments(renderPointer, linkedContent) {
    return extractEndowments(link, renderPointer, linkedContent);
  }

  let obj = RenderLink(linkName, link, homeEdl, {
    directMetaEndowments: allDirectAttributeMetaEndowments
  });

  return obj;
}

export function ContentMetalink(linkName, link, homeEdl) {
  function allContentAttributeMetaEndowments(renderPointer, linkedContent) {
    return extractEndowments(link, renderPointer, linkedContent);
  }

  let obj = RenderLink(linkName, link, homeEdl, {
    contentMetaEndowments: allContentAttributeMetaEndowments
  });

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
