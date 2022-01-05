import { describe, it, expect } from '@jest/globals';
import { Link, LinkPointer, Endset } from '@commonplace/core';
import { RenderLinkFactory2 } from './render-link-factory';

function makeLinkMap(links) {
  return new Map(links.map((l, i) => [LinkPointer(i.toString()), l]));
}

describe('renderLinks', () => {
  it('returns a RenderLink for each passed link', () => {
    let links = [Link("foo"), Link("foo"), Link("foo")];

    expect(RenderLinkFactory2(makeLinkMap(links)).renderLinks().map(x => x.link)).toEqual(links)
  });

  it('attaches a link to the link it points to', () => {
    let links = [Link("foo", Endset(undefined, [LinkPointer("1")])), Link("foo")];

    let actual = RenderLinkFactory2(makeLinkMap(links)).renderLinks()[1].modifiers;

    expect(actual).toHaveLength(1);
    expect(actual[0].link).toEqual(links[0]);
  });

  it('attaches a link to the link it points to, two levels', () => {
    let links = [Link("foo", Endset("x", [LinkPointer("1")])), Link("foo", Endset(undefined, [LinkPointer("2")])), Link("foo")];

    let actual = RenderLinkFactory2(makeLinkMap(links)).renderLinks();

    expect(actual[2].modifiers).toHaveLength(1);
    expect(actual[2].modifiers[0].link).toEqual(links[1]);
    expect(actual[1].modifiers).toHaveLength(1);
    expect(actual[1].modifiers[0].link).toEqual(links[0]);
  });  
});
