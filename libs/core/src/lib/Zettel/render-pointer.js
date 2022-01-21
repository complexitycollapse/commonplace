import { addProperties, finalObject } from '../utils';
import { LinkPointer, LinkTypePointer } from '../pointers';
import { RenderEndset } from './render-endset';
import { Endset, Link } from '../model';
import { RenderLink } from './render-link';

export function RenderPointer(pointer, renderEndset) {
  let obj = {};

  addProperties(obj, {
    pointer,
    renderEndset,
    renderLink: renderEndset.renderLink,
    getAttributeEndowment: () => undefined,
    getAllAttributeEndowments: () => undefined
  });

  return finalObject(obj);
}

export function mockLinkRenderPointer(linkName, attributes) {
  let pointer = LinkPointer(linkName);
  return mockRenderPointer(pointer, attributes);
}

export function mockLinkTypeRenderPointer(linkType, attributes) {
  let pointer = LinkTypePointer(linkType);
  return mockRenderPointer(pointer, attributes);
}

function mockRenderPointer(pointer, attributes) {
  let link = Link(undefined, Endset(undefined, [pointer]));
  let rl = RenderLink(link);
  return {
    pointer,
    renderEndset: RenderEndset(link.endsets[0], rl),
    renderLink: rl,
    getAttributeEndowment: name => attributes[name],
    getAllAttributeEndowments: () => attributes
  };
}
