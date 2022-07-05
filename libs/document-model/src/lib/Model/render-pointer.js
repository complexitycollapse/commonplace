import { addProperties, finalObject } from '@commonplace/utils';
import { EdlPointer, LinkPointer, LinkTypePointer } from '@commonplace/core';
import { Edl, Link } from '@commonplace/core';
import { RenderLink } from './render-link';
import { makeTestEdlZettelWithLinks } from './edl-zettel';

export function RenderPointer(pointer, renderEnd) {
  let obj = {};

  addProperties(obj, {
    pointer,
    renderEnd,
    renderLink: renderEnd.renderLink
  });

  return finalObject(obj, {
    allDirectAttributeEndowments: () => obj.renderLink.allDirectAttributeEndowments(obj, renderEnd.end),
    allContentAttributeEndowments: () =>  obj.renderLink.allContentAttributeEndowments(obj, renderEnd.end),
    sequenceDetails: () => obj.renderLink.sequenceDetails(obj),
    allDirectAttributeMetaEndowments: () => obj.renderLink.allDirectAttributeMetaEndowments(obj, renderEnd.end),
    allContentAttributeMetaEndowments: () => obj.renderLink.allContentAttributeMetaEndowments(obj, renderEnd.end),
    metaSequenceDetailsFor: renderPointer => obj.renderLink.metaSequenceDetailsFor(renderPointer, obj)
  });
}

export function mockLinkRenderPointer(linkName, directAttributes = {}, contentAttributes = {}) {
  let pointer = LinkPointer(linkName);
  return mockRenderPointer(pointer, directAttributes, contentAttributes);
}

export function mockLinkTypeRenderPointer(linkType, attributes = {}) {
  let pointer = LinkTypePointer(linkType);
  return mockRenderPointer(pointer, attributes);
}

export function mockEdlRenderPointer(edlName, attributes = {}) {
  let pointer = EdlPointer(edlName);
  return mockRenderPointer(pointer, attributes);
}

function mockRenderPointer(pointer, directAttributes, contentAttributes) {
  let linkPointerForEdl = LinkPointer("unique type that will not be shared sdfsdfsdfsd");
  let link = Link(undefined, [undefined, [pointer]]);
  let edl = Edl(undefined, [], [linkPointerForEdl]);
  let edlZettel = makeTestEdlZettelWithLinks(edl, [link]);
  let rl = RenderLink("mock", link, edlZettel);
  let directMap = new Map(Object.entries(directAttributes));
  let contentMap = new Map(Object.entries(contentAttributes));
  return {
    pointer,
    renderEnd: rl.getRenderEnd(link.ends[0]),
    renderLink: rl,
    allDirectAttributeEndowments: () => directMap,
    allContentAttributeEndowments: () => contentMap
  };
}
