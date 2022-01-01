import { test, expect, describe, it } from '@jest/globals';
import { RenderLink } from './render-link';
import { Link, LinkPointer, Endset, DocPointer, Span } from '@commonplace/core';

function makeParagraphLink(...pointers) {
  return RenderLink(Link(
    "paragraph", 
    Endset(undefined, pointers.map(p => {
      if (typeof p === "string") {
        if (p.startsWith("link")) { return LinkPointer(p); }
        else if (p.startsWith("doc")) { return DocPointer(p); }
      }
      return p;
    }))));
}

test('if the type is unknown then the RenderLink properties are falsy', () => {
  let link = RenderLink(Link("some unknown type"));

  expect(link.innerTag).toBeFalsy();
  expect(link.style()).toBeFalsy();
  expect(link.fragmentTag).toBeFalsy();
});

test('if the type has a fragmentTag then this is set on the RenderLink', () => {
  let link = RenderLink(Link("paragraph"));

  expect(link.fragmentTag).toBe("p");
});

test('if the type has a style then this is set on the RenderLink', () => {
  let link = RenderLink(Link("bold"));

  expect(link.style()).toEqual({fontWeight: "bold"});
});

describe('fragments', () => {
  it('returns an empty array if the link has no endsets', () => {
    expect(makeParagraphLink().fragments()).toEqual([]);
  });

  it('returns an empty array if the link has only link and doc pointers', () => {
    expect(makeParagraphLink().fragments("link", "doc")).toEqual([]);
  });

  it('returns a fragment for each clip pointer', () => {
    let link = makeParagraphLink(Span("x", 1, 2), Span("y", 1, 2), Span("z", 1, 2));

    expect(link.fragments()).toHaveLength(3);
  });

  it('returns a only fragments for clip pointers', () => {
    let link = makeParagraphLink(Span("x", 1, 2), "link", "doc");

    let actual = link.fragments();

    expect(actual).toHaveLength(1);
    expect(actual[0].clip).toEqual(link.endsets[0].pointers[0]);
  });

  it('returns no fragments if the RenderLink has no fragment tag', () => {
    let link = RenderLink(Link("italics", Endset(undefined, [Span("x", 1, 2), Span("y", 1, 2), Span("z", 1, 2)])));

    expect(link.fragments()).toHaveLength(0);
  });

  it('sets the fragment properties correctly', () => {
    let span = Span("x", 1, 2);
    let endset = Endset(undefined, [span]);
    let link = RenderLink(Link("paragraph", endset));

    let actual = link.fragments()[0];

    expect(actual.clip).toEqual(span);
    expect(actual.endset).toEqual(endset);
    expect(actual.renderLink).toEqual(link);
  });
});
