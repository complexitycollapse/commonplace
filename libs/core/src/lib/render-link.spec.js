import { test, expect } from '@jest/globals';
import { RenderLink } from './render-link';
import { LinkPointer, EdlPointer } from './pointer';
import { Link } from './link';
import { Endset } from './endset';

function makeParagraphLink(...pointers) {
  return RenderLink(Link(
    "paragraph", 
    Endset(undefined, pointers.map(p => {
      if (typeof p === "string") {
        if (p.startsWith("link")) { return LinkPointer(p); }
        else if (p.startsWith("edl")) { return EdlPointer(p); }
      }
      return p;
    }))));
}

test('if the type is unknown then the innerTag and fragmentTag properties are falsy', () => {
  let link = RenderLink(Link("some unknown type"));

  expect(link.innerTag).toBeFalsy();
  expect(link.fragmentTag).toBeFalsy();
});

test('if the type is unknown then style returns an empty object', () => {
  let link = RenderLink(Link("some unknown type"));

  expect(link.style()).toEqual({});
});

test('if the type has a fragmentTag then this is set on the RenderLink', () => {
  let link = RenderLink(Link("paragraph"));

  expect(link.fragmentTag).toBe("p");
});

test('if the type has a style then it is returned by style', () => {
  let link = RenderLink(Link("bold"));

  expect(link.style()).toEqual({bold: true});
});
