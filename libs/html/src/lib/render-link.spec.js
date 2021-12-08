import { test, expect } from '@jest/globals';
import { RenderLink } from './render-link';
import { Link } from '@commonplace/core';

test('if the type is unknown then the RenderLink properties are falsy', () => {
  let link = RenderLink(Link("some unknown type"));

  expect(link.innerTag).toBeFalsy();
  expect(link.style).toBeFalsy();
  expect(link.fragmentTag).toBeFalsy();
});

test('if the type has a fragmentTag then this is set on the RenderLink', () => {
  let link = RenderLink(Link("paragraph"));

  expect(link.fragmentTag).toBe("p");
});
