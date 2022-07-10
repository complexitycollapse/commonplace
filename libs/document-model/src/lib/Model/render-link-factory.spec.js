import { describe, it, expect } from '@jest/globals';
import { Link } from '@commonplace/core';
import { LinkPointer } from '@commonplace/core';
import { RenderLinkFactory } from './render-link-factory';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';

function makeLinksByPointer(links) {
  return links.map((l, i) => [LinkPointer("link-" + i.toString()), l]);
}

function makeEdlZettel(linksByName, parent) {
  return makeTestEdlAndEdlZettelFromLinks(linksByName.map(x => x[1]), linksByName.map(x => x[0]), parent);
}

function getLinks(renderLinks) {
  return renderLinks.map(x => x.link);
}

describe('renderLinks', () => {
  it('returns a RenderLink for each passed link', () => {
    let links = [Link("foo1"), Link("foo2"), Link("foo3")];
    let linksByPointer = makeLinksByPointer(links);
    let edlZettel = makeEdlZettel(linksByPointer);
    let factory = RenderLinkFactory(edlZettel);

    let renderLinks = factory.renderLinks();

    expect(getLinks(renderLinks)).toEqual(links);
  });

  it('returns a RenderLink child AND parent links', () => {
    let links = [Link("foo1"), Link("foo2")];
    let linksByPointer = makeLinksByPointer(links);
    let parent = makeEdlZettel([linksByPointer[1]]);
    let edlZettel = makeEdlZettel([linksByPointer[0]], parent);
    let factory = RenderLinkFactory(edlZettel);

    let renderLinks = factory.renderLinks();

    expect(getLinks(renderLinks)).toEqual(links);
  });

  it('attached the EDL to every link', () => {
    let edl = makeEdlZettel(makeLinksByPointer([Link("foo")]));
    let renderLinks = RenderLinkFactory(edl).renderLinks();
    expect(renderLinks[0].getHomeEdl()).toBe(edl);
  });

  it('attached the parent EDL to links originating in the parent and child EDL likewise', () => {
    let parent = makeEdlZettel(makeLinksByPointer([Link("foo1")]));
    let edl = makeEdlZettel(makeLinksByPointer([Link("foo2")]), parent);
    let renderLinks = RenderLinkFactory(edl).renderLinks();
    expect(renderLinks.find(r => r.link.type === "foo1").getHomeEdl()).toBe(parent);
    expect(renderLinks.find(r => r.link.type === "foo2").getHomeEdl()).toBe(edl);
  });

  it('attached the grandparent EDL to links originating in the grandparent', () => {
    let grandparent = makeEdlZettel(makeLinksByPointer([Link("foo1")]));
    let parent = makeEdlZettel(makeLinksByPointer([Link("foo2")]), grandparent);
    let edl = makeEdlZettel(makeLinksByPointer([Link("foo3")]), parent);
    let renderLinks = RenderLinkFactory(edl).renderLinks();
    expect(renderLinks.find(r => r.link.type === "foo1").getHomeEdl()).toBe(grandparent);
  });

  it('does not return a RenderLink if the link was undefined', () => {
    let links = [Link("foo"), Link("foo"), Link("foo")];
    let linksByName = makeLinksByPointer(links);
    linksByName[LinkPointer("missing link")] = undefined;

    let renderLinks = RenderLinkFactory(makeEdlZettel(linksByName)).renderLinks();

    expect(renderLinks).toHaveLength(3);
    expect(renderLinks.map(x => x.pointer.linkName)).toContain(linksByName[0][0].linkName);
    expect(renderLinks.map(x => x.pointer.linkName)).not.toContain("missing link");
    expect(getLinks(renderLinks)).toEqual(links);
  });

  it('attaches a link to the link it points to', () => {
    let links = [
      [LinkPointer("a"), Link("foo", ["x", [LinkPointer("b")]])],
      [LinkPointer("b"), Link("bar")]
    ];

    let renderLinks = RenderLinkFactory(makeEdlZettel(links)).renderLinks();
    let actual = renderLinks[1].modifiers.renderPointers();

    expect(actual).toHaveLength(1);
    expect(actual[0].pointer).toEqual(links[0][1].ends[0].pointers[0]);
    expect(actual[0].renderEnd.end).toEqual(links[0][1].ends[0]);
    expect(actual[0].renderLink.link).toEqual(links[0][1]);
  });

  it('attaches a link to the link it points to, two levels', () => {
    let links = [
      [LinkPointer("a"), Link("foo1", ["x", [LinkPointer("b")]])],
      [LinkPointer("b"), Link("foo2", [undefined, [LinkPointer("c")]])],
      [LinkPointer("c"), Link("foo3")]
    ];

    let actual = RenderLinkFactory(makeEdlZettel(links)).renderLinks();

    expect(actual[2].modifiers.renderPointers()).toHaveLength(1);
    expect(actual[2].modifiers.renderPointers()[0].renderLink.link).toEqual(links[1][1]);
    expect(actual[1].modifiers.renderPointers()).toHaveLength(1);
    expect(actual[1].modifiers.renderPointers()[0].renderLink.link).toEqual(links[0][1]);
  });
});