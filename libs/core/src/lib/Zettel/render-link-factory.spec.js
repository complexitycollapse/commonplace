import { describe, it, expect } from '@jest/globals';
import { Link } from '../Model/link';
import { LinkPointer } from '../Pointers/pointer';
import { Endset } from '../Model/endset';
import { RenderLinkFactory } from './render-link-factory';

function makeNameLinkPairs(links) {
  return links.map((l, i) => [LinkPointer("link-" + i.toString()).hashableName(), l]);
}

describe('renderLinks', () => {
  it('returns a RenderLink for each passed link', () => {
    let links = [Link("foo"), Link("foo"), Link("foo")];
    expect(RenderLinkFactory(makeNameLinkPairs(links)).renderLinks().map(x => x.link)).toEqual(links)
  });

  it('does not return a RenderLink if the link was undefined', () => {
    let links = [Link("foo"), Link("foo"), Link("foo")];
    let nameLinkPairs = makeNameLinkPairs(links);
    nameLinkPairs.push(["missing link", undefined]);

    let renderLinks = RenderLinkFactory(nameLinkPairs).renderLinks();

    expect(renderLinks).not.toHaveProperty("missing link");
    expect(renderLinks.map(x => x.link)).toEqual(links);
  });

  it('attaches a link to the link it points to', () => {
    let links = [
      Link("foo", Endset(undefined, [LinkPointer("link-1")])),
      Link("foo")
    ];

    let actual = RenderLinkFactory(makeNameLinkPairs(links)).renderLinks()[1].modifiers;

    expect(actual).toHaveLength(1);
    expect(actual[0].link).toEqual(links[0]);
  });

  it('attaches a link to the link it points to, two levels', () => {
    let links = [
      Link("foo", Endset("x", [LinkPointer("link-1")])),
      Link("foo", Endset(undefined, [LinkPointer("link-2")])),
      Link("foo")
    ];

    let actual = RenderLinkFactory(makeNameLinkPairs(links)).renderLinks();

    expect(actual[2].modifiers).toHaveLength(1);
    expect(actual[2].modifiers[0].link).toEqual(links[1]);
    expect(actual[1].modifiers).toHaveLength(1);
    expect(actual[1].modifiers[0].link).toEqual(links[0]);
  });  
});
