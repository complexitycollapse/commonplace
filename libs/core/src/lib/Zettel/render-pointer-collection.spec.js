import { expect, test } from '@jest/globals';
import { RenderPointerCollection } from './render-pointer-collection';
import { mockLinkRenderPointer, mockLinkTypeRenderPointer } from './render-pointer';

test('getting an attribute value from an enpty collection returns undefined', () => {
  expect(RenderPointerCollection().get("key")).toBe(undefined);
});

test('if a link pointer has been added, get should retrieve the attributes', () => {
  let pointer = mockLinkRenderPointer("name", {attr: "expected value"});
  let rpc = RenderPointerCollection();
  
  rpc.add(pointer);

  expect(rpc.get("attr")).toBe("expected value");
});

test('if a link type pointer has been added, get should retrieve the attributes', () => {
  let pointer = mockLinkTypeRenderPointer("type", {attr: "expected value"});
  let rpc = RenderPointerCollection();
  
  rpc.add(pointer);

  expect(rpc.get("attr")).toBe("expected value");
});

test('if both a link and link type pointer have the attribute, return the link pointer value', () => {
  let linkPointer = mockLinkRenderPointer("name", {attr: "expected value"});
  let typePointer = mockLinkTypeRenderPointer("type", {attr: "hidden value"});
  let rpc = RenderPointerCollection();
  
  rpc.add(linkPointer);
  rpc.add(typePointer);

  expect(rpc.get("attr")).toBe("expected value");
});

test('if a link type pointer has the attribute value but no link pointer does, return the link type value', () => {
  let linkPointer = mockLinkRenderPointer("name", {otherAttr: "ignored value"});
  let typePointer = mockLinkTypeRenderPointer("type", {attr: "expected value"});
  let rpc = RenderPointerCollection();
  
  rpc.add(linkPointer);
  rpc.add(typePointer);

  expect(rpc.get("attr")).toBe("expected value");
});

test('if no link or link type pointers have the requested attribute, return undefined', () => {
  let linkPointer = mockLinkRenderPointer("name", {otherAttr: "ignored value"});
  let typePointer = mockLinkTypeRenderPointer("type", {otherAttr: "ignored value"});
  let rpc = RenderPointerCollection();
  
  rpc.add(linkPointer);
  rpc.add(typePointer);

  expect(rpc.get("attr")).toBe(undefined);
});

test('if there are two link pointers with the attribute, the value of the second one to be added takes precedence', () => {
  let linkPointer1 = mockLinkRenderPointer("name", {attr: "ignored value"});
  let linkPointer2 = mockLinkRenderPointer("name", {attr: "expected value"});
  let rpc = RenderPointerCollection();
  
  rpc.add(linkPointer1);
  rpc.add(linkPointer2);

  expect(rpc.get("attr")).toBe("expected value");
});


test('if there are two link pointers with the attribute, the value of the second one to be added takes precedence', () => {
  let typePointer1 = mockLinkTypeRenderPointer("type", {attr: "ignored value"});
  let typePointer2 = mockLinkTypeRenderPointer("type", {attr: "expected value"});
  let rpc = RenderPointerCollection();
  
  rpc.add(typePointer1);
  rpc.add(typePointer2);

  expect(rpc.get("attr")).toBe("expected value");
});
