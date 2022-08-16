import { addProperties, finalObject } from '@commonplace/utils';
import { EdlPointer, LinkPointer, Edl, Link } from '@commonplace/core';
import { RenderLink } from './render-link';
import { makeTestEdlZettelWithLinks } from './edl-zettel';
import { AttributeDescriptor } from '../Attributes/attribute-descriptor';

export function RenderPointer(pointer, renderEnd) {
  let obj = {};

  addProperties(obj, {
    pointer,
    renderEnd,
    renderLink: renderEnd.renderLink
  });

  function comparePriority(otherPointer) {
    let linkPriority = otherPointer.renderLink.comparePriority(obj.renderLink);
    return linkPriority != 0 ? linkPriority : otherPointer.renderEnd.index - obj.renderEnd.index;
  }

  function getAttributeDescriptors(endowmentType, endowmentsFn) {
    let endowments = endowmentsFn();
    let descriptors = [...endowments.entries()].map(([name, value]) => AttributeDescriptor(name, value, obj, endowmentType));
    return descriptors;
  }

  function createSequenceDetailsEndowmentForPointer(endowment) {
    return Object.create(endowment, { endowingPointer: obj });
  }

  return finalObject(obj, {
    comparePriority,
    directAttributeDescriptors: () => getAttributeDescriptors("direct", obj.allDirectAttributeEndowments),
    contentAttributeDescriptors: () => getAttributeDescriptors("content", obj.allContentAttributeEndowments),
    allDirectAttributeEndowments: () => obj.renderLink.allDirectAttributeEndowments(obj, renderEnd.end),
    allContentAttributeEndowments: () =>  obj.renderLink.allContentAttributeEndowments(obj, renderEnd.end),
    sequenceDetailsEndowments: () => obj.renderLink.sequenceDetailsEndowmentPrototypes(renderEnd, obj).map(createSequenceDetailsEndowmentForPointer),
    allDirectAttributeMetaEndowments: () => obj.renderLink.allDirectAttributeMetaEndowments(obj, renderEnd.end),
    allContentAttributeMetaEndowments: () => obj.renderLink.allContentAttributeMetaEndowments(obj, renderEnd.end),
    metaSequenceDetailPrototypessFor: targetRenderEnd => obj.renderLink.metaSequenceDetailPrototypessFor(targetRenderEnd, renderEnd)
  });
}

export function mockLinkRenderPointer(linkName, directAttributes = {}, contentAttributes = {}) {
  let pointer = LinkPointer(linkName);
  return mockRenderPointer(pointer, directAttributes, contentAttributes);
}

// export function mockLinkTypeRenderPointer(linkType, attributes = {}) {
//   let pointer = LinkTypePointer(linkType);
//   return mockRenderPointer(pointer, attributes);
// }

export function mockEdlRenderPointer(edlName, attributes = {}) {
  let pointer = EdlPointer(edlName);
  return mockRenderPointer(pointer, attributes);
}

function mockRenderPointer(pointer, directAttributes, contentAttributes) {
  let linkPointerForEdl = LinkPointer("unique type that will not be shared sdfsdfsdfsd");
  let link = Link(undefined, [undefined, [pointer]]);
  let edl = Edl(undefined, [], [linkPointerForEdl]);
  let edlZettel = makeTestEdlZettelWithLinks(edl, [link]);
  let rl = RenderLink("mock", link, edlZettel, 0);
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
