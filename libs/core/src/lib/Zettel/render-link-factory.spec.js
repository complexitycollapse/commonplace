import { describe, it, expect } from '@jest/globals';
import { Link, Endset } from '../model';
import { LinkPointer } from '../pointers';
import { RenderLinkFactory } from './render-link-factory';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';

function makeLinksByName(links) {
  return links.map((l, i) => [LinkPointer("link-" + i.toString()), l]);
}

function makeEdlZettel(linksByName, parent) {
  return makeTestEdlAndEdlZettelFromLinks(linksByName.map(x => x[1]), linksByName.map(x => x[0]), parent);
}

function getLinks(renderLinks) {
  return renderLinks.map(x => x[1].link);
}

describe('renderLinks', () => {
  it('returns a RenderLink for each passed link', () => {
    let links = [Link("foo"), Link("foo"), Link("foo")];
    let linksByPointer = makeLinksByName(links);
    let edlZettel = makeEdlZettel(linksByPointer);
    let factory = RenderLinkFactory(edlZettel);

    let renderLinks = factory.renderLinks();

    expect(getLinks(renderLinks)).toEqual(links);
  });

  it('attached the EDL to every link', () => {
    let edl = makeEdlZettel(makeLinksByName([Link("foo")]));
    let renderLinks = RenderLinkFactory(edl).renderLinks();
    expect(renderLinks[0][1].getHomeEdl()).toBe(edl);
  });

  it('does not return a RenderLink if the link was undefined', () => {
    let links = [Link("foo"), Link("foo"), Link("foo")];
    let linksByName = makeLinksByName(links);
    linksByName["missing link"] = undefined;

    let renderLinks = RenderLinkFactory(makeEdlZettel(linksByName)).renderLinks();

    expect(renderLinks.map(x => x[0].linkName)).not.toContain("missing link");
    expect(getLinks(renderLinks)).toEqual(links);
  });

  it('attaches a link to the link it points to', () => {
    let links = [
      [LinkPointer("a"), Link("foo", Endset("x", [LinkPointer("b")]))],
      [LinkPointer("b"), Link("bar")]
    ];


    let renderLinks = RenderLinkFactory(makeEdlZettel(links)).renderLinks();
    let actual = renderLinks[1][1].modifiers.renderPointers();

    expect(actual).toHaveLength(1);
    expect(actual[0].pointer).toEqual(links[0][1].endsets[0].pointers[0]);
    expect(actual[0].renderEndset.endset).toEqual(links[0][1].endsets[0]);
    expect(actual[0].renderLink.link).toEqual(links[0][1]);
  });

  it('attaches a link to the link it points to, two levels', () => {
    let links = [
      [LinkPointer("a"), Link("foo1", Endset("x", [LinkPointer("b")]))],
      [LinkPointer("b"), Link("foo2", Endset(undefined, [LinkPointer("c")]))],
      [LinkPointer("c"), Link("foo3")]
    ];

    let actual = RenderLinkFactory(makeEdlZettel(links)).renderLinks();

    expect(actual[2][1].modifiers.renderPointers()).toHaveLength(1);
    expect(actual[2][1].modifiers.renderPointers()[0].renderLink.link).toEqual(links[1][1]);
    expect(actual[1][1].modifiers.renderPointers()).toHaveLength(1);
    expect(actual[1][1].modifiers.renderPointers()[0].renderLink.link).toEqual(links[0][1]);
  });  
});
