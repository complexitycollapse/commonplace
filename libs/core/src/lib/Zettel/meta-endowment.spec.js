import { describe, it, expect } from '@jest/globals';
import { Link } from '../model';
import { Part } from '../part';
import { Span, InlinePointer } from '../pointers';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';
import { RenderLink } from './render-link';
import { MetaEndowment } from './meta-endowment';

function renderLinkWithValueEnd(valueEndName, value) {
  let pointer = typeof value === "string" ? Span("x", 1, value.length) : InlinePointer(value);
  let link = Link(undefined, ["endowing end", []], [valueEndName, [pointer]]);
  let edlZ = makeTestEdlAndEdlZettelFromLinks([link]);
  let renderLink = RenderLink(edlZ.edl.links[0], link, edlZ);
  renderLink.renderEnds[1].resolveContent(Part(pointer, value));
  return renderLink;
}

function renderPointer(renderLink) {
  return renderLink.createRenderPointer(Span("y", 100, 1), renderLink.link.ends[0]);
}

describe('calculateValueForPointer', () => {
  it('returns the default value if no value end is set', () => {
    let renderLink = renderLinkWithValueEnd("val end", "Val 123");
    let me = MetaEndowment("attr1", "default value", false);

    expect(me.calculateValueForPointer(renderPointer(renderLink))).toEqual([true, "default value"]);
  });

  it('returns [false, undefined] if there is no default value or value end', () => {
    let renderLink = renderLinkWithValueEnd("val end", "Val 123");
    let me = MetaEndowment("attr1", undefined, false);

    expect(me.calculateValueForPointer(renderPointer(renderLink))).toEqual([false, undefined]);
  });

  it('returns the default value if there is a value end set but the link does not have it', () => {
    let renderLink = renderLinkWithValueEnd("false val end", "Val 123");
    let me = MetaEndowment("attr1", "default value", true, "true val end");

    expect(me.calculateValueForPointer(renderPointer(renderLink))).toEqual([true, "default value"]);
  });

  it('returns [false, undefined] if there is a value end set but the link does not have it and there is no default', () => {
    let renderLink = renderLinkWithValueEnd("false val end", "Val 123");
    let me = MetaEndowment("attr1", undefined, true, "true val end");

    expect(me.calculateValueForPointer(renderPointer(renderLink))).toEqual([false, undefined]);
  });

  it('returns the value pointed to by the specified value end if it is present on the link', () => {
    let renderLink = renderLinkWithValueEnd("val end", "expected value");
    let me = MetaEndowment("attr1", "default value", true, "val end");

    expect(me.calculateValueForPointer(renderPointer(renderLink))).toEqual([true, "expected value"]);
  });

  it('returns a boolean value not a string if there is a single boolean end', () => {
    let renderLink = renderLinkWithValueEnd("val end", true);
    let me = MetaEndowment("attr1", "default value", true, "val end");

    expect(me.calculateValueForPointer(renderPointer(renderLink))).toEqual([true, true]);
  });
});
