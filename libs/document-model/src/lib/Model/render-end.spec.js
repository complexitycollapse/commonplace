import { describe, it, expect } from '@jest/globals';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';
import { RenderEnd } from './render-end';
import { RenderLink } from './render-link';
import { Link } from '@commonplace/core';
import { Span, InlinePointer } from '@commonplace/core';
import { Part } from '@commonplace/core';

function make(...pointersAndContent) {
  let link = Link(undefined, ["foo", pointersAndContent.map(x => x[0])]);
  let parts = pointersAndContent.filter(x => x[1]).map(x => Part(x[0], x[1]));
  let edlZ = makeTestEdlAndEdlZettelFromLinks([link]);
  let renderEnd = RenderEnd(link.ends[0], RenderLink(edlZ.edl.links[0], link, edlZ, 0));
  parts.forEach(renderEnd.resolveContent);
  return renderEnd;
}

describe('concatatext', () => {
  it('returns the empty string if there are no pointers', () => {
    expect(make().concatatext()).toBe("");
  });

  it('returns undefined if some pointers do not have their content yet', () => {
    expect(make([Span("a", 1, 1), "A"], [Span("b", 1, 1)], [Span("c", 1, 1), "C"]).concatatext()).toBe(undefined);
  });

  it('returns undefined if some pointers have content that is not a string', () => {
    expect(make([Span("a", 1, 1), "A"], [Span("b", 1, 1), 5], [Span("c", 1, 1), "C"]).concatatext()).toBe(undefined);
  });

  it('returns the concatenation of the string content of all pointers in the given order', () => {
    expect(make([Span("a", 1, 1), "A"], [Span("b", 1, 1), "B"], [Span("c", 1, 1), "C"]).concatatext()).toBe("ABC");
  });

  it('returns a boolean value, not a string, if the end has a single inline pointer with that value', () => {
    expect(make([InlinePointer(true)]).concatatext()).toBe(true);
  });
});
