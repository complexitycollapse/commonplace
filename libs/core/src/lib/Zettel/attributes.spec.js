import { expect, it, describe } from '@jest/globals';
import { Attributes } from './attributes';
import { links as linkTesting } from '../testing'
import { EdlZettel, makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';
import { RenderPointerCollection } from './render-pointer-collection';
// import { mockLinkRenderPointer, mockLinkTypeRenderPointer } from './render-pointer';
import { PointerTypePointer, EdlPointer, InlinePointer, LinkPointer, LinkTypePointer, Span } from '../pointers';
import { Edl, Endset, Link } from '../model';
import { DirectMetalink } from '../Model/link';
import { Part } from '../part';
import { DirectMetalinkBuilder, EdlBuilder, EdlZettelBuilder, EndsetBuilder, LinkBuilder, SpanBuilder } from '../builders';

function hasAttribute(values, attribute, expectedValue) {
  if (!values.has(attribute)) {
    return {
      pass: false,
      message: () => `expected attribute ${attribute} was not found`
    };
  }

  if (values.get(attribute) !== expectedValue) {
    return {
      pass: false,
      message: () => `expected attribute ${attribute} to have value ${expectedValue}, actually ${values.get(attribute)}`
    };
   } else {
    return {
    pass: true,
      message: () => `expected attribute ${attribute} to have value different from ${expectedValue}`
    };
  }
}

function hasExactlyAttributes(values, ...attributeValuePairs) {
  let keys = [...values.keys()];
  for (let i = 0; i < attributeValuePairs.length; i += 2) {
    let present = hasAttribute(values, attributeValuePairs[i], attributeValuePairs[i+1]);
    if (!present.pass) {
      return present;
    }
    keys = keys.filter(x => x !== attributeValuePairs[i]);
  }

  if (keys.length == 0) {
    return {
      pass: true,
      message: () => "Expected additional keys"
    };
  } else {
    return {
      pass: false,
      message: () => `Unexpected keys: ${JSON.stringify(keys)}`
    };
  }
}

expect.extend({
 hasAttribute,
 hasExactlyAttributes
});

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

function anEdlZettel(edl = anEdl(), parent) {
  return EdlZettelBuilder(edl).withParent(parent);
}

function aLinkAndMetalinkPointingTo(pointerType, targetBuilder, ...attributePairs) {
  let type = `${attributePairs[0]}:${attributePairs[1]}`;
  let target = targetBuilder.build();
  let pointer = pointerType == "specific" ? target : PointerTypePointer(target.pointerType);
  let endowingLink = aLink(type, pointer);
  let metaLink = aDirectMetalink(`metalink for ${type}`).pointingTo(endowingLink).endowing(...attributePairs);
  return [endowingLink, metaLink];
}

function anEdlZettelWithSpan(edl = anEdl(), parent) {
  let target = aSpan();
  edl.withClip(target);
  let builder = anEdlZettel(edl, parent);
  builder.target = target;
  builder.withLinkWithDirectAttributes = (pointerType, attributeName, attributeValue) => {
    let links = aLinkAndMetalinkPointingTo(pointerType, target, attributeName, attributeValue);
    edl.withLinks(...links);
    return builder;
  };
  return builder;
}

function make(targetBuilder, edlZBuilder) {
  let target = targetBuilder.build();
  let edlZ = edlZBuilder.build();
  let targetZettel = edlZ.children.find(z => target.endowsTo(z.clip));
  if (!targetZettel) { throw(`make failed, target Zettel not found. Pointer was ${JSON.stringify(target)}.`); }
  let attributes = Attributes(targetZettel, undefined, [...targetZettel.renderPointers.pointerStack()]);
  return attributes;
}

it('returns no attributes if there are no pointers', () => {
  let target = aSpan();
  let attributes = make(target, anEdlZettel(anEdl().withClip(target)));
  expect(attributes.values()).hasExactlyAttributes();
});

describe.each(
  [["specific"], ["pointer type"]]
)("direct attributes", (pointerKind) => {

  it('returns the value endowed by a specific pointer', () => {
    let edlZ = anEdlZettelWithSpan().withLinkWithDirectAttributes(pointerKind, "attr1", "val1");
    let attributes = make(edlZ.target, edlZ);

    let values = attributes.values();

    expect(values).hasAttribute("attr1", "val1");
  });

  it('returns all values of all attributes', () => {
    let edlZ = anEdlZettelWithSpan()
      .withLinkWithDirectAttributes(pointerKind, "attr1", "val1")
      .withLinkWithDirectAttributes(pointerKind, "attr2", "val2")
      .withLinkWithDirectAttributes(pointerKind, "attr3", "val3");
    let attributes = make(edlZ.target, edlZ);

    let values = attributes.values();

    expect(values).hasAttribute("attr1", "val1");
    expect(values).hasAttribute("attr2", "val2");
    expect(values).hasAttribute("attr3", "val3");
  });

  it('returns the later value in the Zettel rather than the earlier one', () => {
    let edlZ = anEdlZettelWithSpan()
      .withLinkWithDirectAttributes(pointerKind, "attr1", "first")
      .withLinkWithDirectAttributes(pointerKind, "attr1", "second");
    let attributes = make(edlZ.target, edlZ);

    let values = attributes.values();

    expect(values).hasAttribute("attr1", "second");
  });

  it('returns the value endowed by a link in the parent', () => {
    let parent = anEdlZettel();
    let child = anEdlZettelWithSpan(anEdl(), parent);
    parent.withLinks(...aLinkAndMetalinkPointingTo(pointerKind, child.target, "attr1", "val1"));
    let attributes = make(child.target, child);

    let values = attributes.values();

    expect(values).hasAttribute("attr1", "val1");
  });

  it('returns the value in the child in preference to that in the parent', () => {
    let parent = anEdlZettel();
    let child = anEdlZettelWithSpan(anEdl(), parent);
    parent.withLinks(...aLinkAndMetalinkPointingTo(pointerKind, child.target, "attr1", "parent value"));
    child.withLinks(...aLinkAndMetalinkPointingTo(pointerKind, child.target, "attr1", "child value"));
    let attributes = make(child.target, child);

    let values = attributes.values();

    expect(values).hasAttribute("attr1", "child value");
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
