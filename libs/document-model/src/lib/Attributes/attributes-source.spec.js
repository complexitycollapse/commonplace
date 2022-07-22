import { describe, it, expect } from '@jest/globals';
import { DirectAttributeSource, ContentAttributeSource } from './attributes-source';
import { makeTestEdlAndEdlZettelFromLinks } from '../Model/edl-zettel';
import { mockLinkRenderPointer } from '../Model/render-pointer';

function mockSource(...pointers) {
  let links = pointers.map(p => p.renderLink);
  let edlZ = makeTestEdlAndEdlZettelFromLinks(links, links.map(l => l.pointer));
  return { edl: edlZ, pointers };
}

describe('DirectAttributeSource', () => {
  function makeAttr(...sources) {
    return DirectAttributeSource(undefined, sources).attributeDescriptors;
  }

  function mockPointer(directAttributes, contentAttributes = {}) {
    return mockLinkRenderPointer("1", directAttributes, contentAttributes);
  }

  it('sets the origin property on the result', () => {
    expect(DirectAttributeSource("the origin", []).origin).toBe("the origin");
  });

  it('returns no attributes if there are no sources', () => {
    expect(makeAttr()).toHaveLength(0);
  });

  it('returns an object for each source', () => {
    let pointer = mockPointer({});
    expect(makeAttr(mockSource(pointer), mockSource(pointer), mockSource(pointer))).toHaveLength(3);
  });
  it('does not return an entry for a render pointer if it has no direct attribute endowments', () => {
    let pointer = mockPointer({});
    expect(makeAttr(mockSource(pointer))[0]).toHaveLength(0);
  });

  it('returns an entry for a render pointer if it has a direct attribute endowment', () => {
    let pointer = mockPointer({attr: "value"});
    expect(makeAttr(mockSource(pointer))[0]).toHaveLength(1);
  });

  it('returns an entry for each direct attribute', () => {
    let pointer = mockPointer({attr1: "v1", attr2: "v2", attr3: "v3"});
    expect(makeAttr(mockSource(pointer))[0]).toHaveLength(3);
  });

  it('does not return an entry for content attribute', () => {
    let pointer = mockPointer({}, {attr: "v1"});
    expect(makeAttr(mockSource(pointer))[0]).toHaveLength(0);
  });

  it('puts each attribute in the object corresponding to the original source', () => {
    let pointer1 = mockPointer({attr1: "v1"});
    let pointer2 = mockPointer({attr2: "v2"});
    let pointer3 = mockPointer({attr3: "v3"});

    let attrs = makeAttr(mockSource(pointer1, pointer2), mockSource(pointer3));

    expect(attrs[0][0].attribute).toBe("attr1");
    expect(attrs[0][1].attribute).toBe("attr2");
    expect(attrs[1][0].attribute).toBe("attr3");
  });

  it('sets pointer, attribute, value and edl on the returned entry', () => {
    let pointer = mockPointer({attr: "v1"});
    let source = mockSource(pointer);
    
    let entry = makeAttr(source)[0][0];
    
    expect(entry.pointer).toBe(pointer);
    expect(entry.attribute).toBe("attr");
    expect(entry.value).toBe("v1");
    expect(entry.edl).toBe(source.edl);
  });
});

describe('ContentAttributeSource', () => {
  function makeAttr(...sources) {
    return ContentAttributeSource(undefined, sources).attributeDescriptors;
  }

  function mockPointer(contentAttributes, directAttributes = {}) {
    return mockLinkRenderPointer("1", directAttributes, contentAttributes);
  }

  it('sets the origin property on the result', () => {
    expect(ContentAttributeSource("the origin", []).origin).toBe("the origin");
  });

  it('returns no attributes if there are no sources', () => {
    expect(makeAttr()).toHaveLength(0);
  });

  it('returns an object for each source', () => {
    let pointer = mockPointer({});
    expect(makeAttr(mockSource(pointer), mockSource(pointer), mockSource(pointer))).toHaveLength(3);
  });
  it('does not return an entry for a render pointer if it has no content attribute endowments', () => {
    let pointer = mockPointer({});
    expect(makeAttr(mockSource(pointer))[0]).toHaveLength(0);
  });

  it('returns an entry for a render pointer if it has a content attribute endowment', () => {
    let pointer = mockPointer({attr: "value"});
    expect(makeAttr(mockSource(pointer))[0]).toHaveLength(1);
  });

  it('returns an entry for each content attribute', () => {
    let pointer = mockPointer({attr1: "v1", attr2: "v2", attr3: "v3"});
    expect(makeAttr(mockSource(pointer))[0]).toHaveLength(3);
  });

  it('does not return an entry for direct attribute', () => {
    let pointer = mockPointer({}, {attr: "v1"});
    expect(makeAttr(mockSource(pointer))[0]).toHaveLength(0);
  });

  it('puts each attribute in the object corresponding to the original source', () => {
    let pointer1 = mockPointer({attr1: "v1"});
    let pointer2 = mockPointer({attr2: "v2"});
    let pointer3 = mockPointer({attr3: "v3"});

    let attrs = makeAttr(mockSource(pointer1, pointer2), mockSource(pointer3));

    expect(attrs[0][0].attribute).toBe("attr1");
    expect(attrs[0][1].attribute).toBe("attr2");
    expect(attrs[1][0].attribute).toBe("attr3");
  });

  it('sets pointer, attribute, value and edl on the returned entry', () => {
    let pointer = mockPointer({attr: "v1"});
    let source = mockSource(pointer);
    
    let entry = makeAttr(source)[0][0];
    
    expect(entry.pointer).toBe(pointer);
    expect(entry.attribute).toBe("attr");
    expect(entry.value).toBe("v1");
    expect(entry.edl).toBe(source.edl);
  });
});
