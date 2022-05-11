import { expect, it, describe } from '@jest/globals';
import { Attributes } from './attributes';
import { links as linkTesting } from '../testing'
import { EdlZettel, makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';
import { RenderPointerCollection } from './render-pointer-collection';
// import { mockLinkRenderPointer, mockLinkTypeRenderPointer } from './render-pointer';
import { EdlPointer, InlinePointer, LinkPointer, LinkTypePointer, Span } from '../pointers';
import { Edl, Endset, Link } from '../model';
import { DirectMetalink } from '../Model/link';
import { Part } from '../part';
import { DirectMetalinkBuilder, EdlBuilder, EndsetBuilder, LinkBuilder, SpanBuilder } from '../builders';

function makeLinks(n = 10) {
  return [...Array(n).keys()].map(linkTesting.makePointerAndLink);
}

function makeEdlZ(links) {
  links = links ?? makeLinks();
  return makeTestEdlAndEdlZettelFromLinks(links.map(x => x[1]), links.map(x => x[1]));
}

function aSpan() {
  return SpanBuilder().withLength(10).withContent(new Array(11).join( "#" ));
}

function anEndset(name) {
  return EndsetBuilder().withName(name);
}

function aLink(name, target) {
  let builder = LinkBuilder().withName(name).withType(name);
  if (target) {
    builder.withEndset(anEndset().withPointer(target));
  }
  return builder;
}

function aDirectMetalink(name) {
  return DirectMetalinkBuilder().withName(name);
}

function anEdl() {
  return EdlBuilder();
}

function anEdlZettel(edl, parent) {
  return {
    build: () => EdlZettel(EdlPointer("foo"), parent, "1", edl.build(), edl.links, edl.clips.map(c => c.defaultPart()))
  };
}

function make(targetBuilder, edlZBuilder) {
  let target = targetBuilder.build(), edlZ = edlZBuilder.build();
  let targetZettel = edlZ.children.find(z => z.clip.hashableName === target.hashableName);
  let a = Attributes(targetZettel, undefined, [...targetZettel.renderPointers.pointerStack()]);
  return a;
}

describe('values', () => {
  it('returns no attributes if there are no pointers', () => {
    let target = aSpan();
    let attributes = make(target, anEdlZettel(anEdl().withClip(target)));
    expect([...attributes.values().keys()]).toHaveLength(0);
  });

  it('returns the value of a direct attribute', () => {
    let target = aSpan();
    let endowingLink = aLink("endowing link", target);
    let metaLink = aDirectMetalink("metalink").pointingTo(endowingLink).endowing("attr1", "val1");
    let edlZ = anEdlZettel(anEdl().withClip(target).withLinks(endowingLink, metaLink));
    let attributes = make(target, edlZ);

    let values = attributes.values();

    expect([...values.keys()]).toHaveLength(1);
    expect(values.has("attr1"));
    expect(values.get("attr1")).toBe("val1");
  });
});

// function make(ownerName, ownerType) {
//   return RenderPointerCollection(LinkPointer(ownerName), LinkTypePointer(ownerType));
// }

// test('getting an attribute value from an empty collection returns undefined', () => {
//   expect(make("name", "type").attributes().key).toBe(undefined);
// });

// test('if a link pointer has been added, attributes should retrieve the attributes', () => {
//   let pointer = mockLinkRenderPointer("name", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(pointer);

//   expect(rpc.attributes().attr).toBe("expected value");
// });

// test('if a link pointer has been added, tryAddRenderPointer returns true', () => {
//   let pointer = mockLinkRenderPointer("name", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   expect(rpc.tryAddRenderPointer(pointer)).toBeTruthy();
// });

// test('if a link pointer is not for this collection, its attributes should not be added', () => {
//   let pointer = mockLinkRenderPointer("wrong name", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(pointer);

//   expect(rpc.attributes().attr).toBe(undefined);
// });

// test('if a link pointer is not for this collection, tryAddRenderPointer returns false', () => {
//   let pointer = mockLinkRenderPointer("wrong name", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   expect(rpc.tryAddRenderPointer(pointer)).toBeFalsy();
// });

// test('if a link type pointer has been added, attributes should retrieve the attributes', () => {
//   let pointer = mockLinkTypeRenderPointer("type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(pointer);

//   expect(rpc.attributes().attr).toBe("expected value");
// });

// test('if a link type pointer has been added, tryAddRenderPointer returns true', () => {
//   let pointer = mockLinkTypeRenderPointer("type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   expect(rpc.tryAddRenderPointer(pointer)).toBeTruthy();
// });

// test('if a link type pointer is not for this collection type, its attributes should not be added', () => {
//   let pointer = mockLinkTypeRenderPointer("wrong type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(pointer);

//   expect(rpc.attributes().attr).toBe(undefined);
// });

// test('if a link type pointer is not for this collection, tryAddRenderPointer returns false', () => {
//   let pointer = mockLinkTypeRenderPointer("wrong type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   expect(rpc.tryAddRenderPointer(pointer)).toBeFalsy();
// });

// test('if both a link and link type pointer have the attribute, return the link pointer value', () => {
//   let linkPointer = mockLinkRenderPointer("name", {attr: "expected value"});
//   let typePointer = mockLinkTypeRenderPointer("type", {attr: "hidden value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(linkPointer);
//   rpc.tryAddRenderPointer(typePointer);

//   expect(rpc.attributes().attr).toBe("expected value");
// });

// test('if a link type pointer has the attribute value but no link pointer does, return the link type value', () => {
//   let linkPointer = mockLinkRenderPointer("name", {otherAttr: "ignored value"});
//   let typePointer = mockLinkTypeRenderPointer("type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(linkPointer);
//   rpc.tryAddRenderPointer(typePointer);

//   expect(rpc.attributes().attr).toBe("expected value");
// });

// test('if no link or link type pointers have the requested attribute, return undefined', () => {
//   let linkPointer = mockLinkRenderPointer("name", {otherAttr: "ignored value"});
//   let typePointer = mockLinkTypeRenderPointer("type", {otherAttr: "ignored value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(linkPointer);
//   rpc.tryAddRenderPointer(typePointer);

//   expect(rpc.attributes().attr).toBe(undefined);
// });

// test('if there are two link pointers with the attribute, the value of the second one to be added takes precedence', () => {
//   let linkPointer1 = mockLinkRenderPointer("name", {attr: "ignored value"});
//   let linkPointer2 = mockLinkRenderPointer("name", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(linkPointer1);
//   rpc.tryAddRenderPointer(linkPointer2);

//   expect(rpc.attributes().attr).toBe("expected value");
// });


// test('if there are two link type pointers with the attribute, the value of the second one to be added takes precedence', () => {
//   let typePointer1 = mockLinkTypeRenderPointer("type", {attr: "ignored value"});
//   let typePointer2 = mockLinkTypeRenderPointer("type", {attr: "expected value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(typePointer1);
//   rpc.tryAddRenderPointer(typePointer2);

//   expect(rpc.attributes().attr).toBe("expected value");
// });

// test('attributes returns all attributes, preferring direct values to type values and later values to earlier', () => {
//   let linkPointer1 = mockLinkRenderPointer("name", {key1: "ignored value"});
//   let linkPointer2 = mockLinkRenderPointer("name", {key1: "key1 value"});
//   let linkPointer3 = mockLinkRenderPointer("name", {key2: "key2 value"});
//   let linkTypePointer1 = mockLinkTypeRenderPointer("type", {key2: "ignored value"});
//   let linkTypePointer2 = mockLinkTypeRenderPointer("type", {key3: "ignored value"});
//   let linkTypePointer3 = mockLinkTypeRenderPointer("type", {key3: "key3 value"});
//   let rpc = make("name", "type");
  
//   rpc.tryAddRenderPointer(linkPointer1);
//   rpc.tryAddRenderPointer(linkPointer2);
//   rpc.tryAddRenderPointer(linkPointer3);
//   rpc.tryAddRenderPointer(linkTypePointer1);
//   rpc.tryAddRenderPointer(linkTypePointer2);
//   rpc.tryAddRenderPointer(linkTypePointer3);

//   expect(rpc.attributes()).toEqual({
//     key1: "key1 value",
//     key2: "key2 value",
//     key3: "key3 value"
//   });
// });
