import { describe, it, expect } from '@jest/globals';
import { Link, Endset } from '../model';
import { LinkPointer } from '../pointers';
import { RenderLinkFactory } from './render-link-factory';

function makeNameLinkPairs(links) {
  return links.map((l, i) => [LinkPointer("link-" + i.toString()).hashableName, l]);
}

function makeEdlZettel(nameLinkPairs, parent) {
  return {
    nameLinkPairs: () => nameLinkPairs,
    parent
  }
}

function getLinks(renderLinkObject) {
  return Object.values(renderLinkObject).map(x => x.link);
}

describe('renderLinks', () => {
  it('returns a RenderLink for each passed link', () => {
    let links = [Link("foo"), Link("foo"), Link("foo")];
    expect(getLinks(RenderLinkFactory(makeEdlZettel(makeNameLinkPairs(links))).renderLinks())).toEqual(links);
  });

  it('attached the EDL to every link', () => {
    let edl = makeEdlZettel(makeNameLinkPairs([Link("foo")]));
    let renderLinks = Object.values(RenderLinkFactory(edl).renderLinks());
    expect(renderLinks[0].homeEdl).toBe(edl);
  });

  it('does not return a RenderLink if the link was undefined', () => {
    let links = [Link("foo"), Link("foo"), Link("foo")];
    let nameLinkPairs = makeNameLinkPairs(links);
    nameLinkPairs.push(["missing link", undefined]);

    let renderLinks = RenderLinkFactory(makeEdlZettel(nameLinkPairs)).renderLinks();

    expect(renderLinks).not.toHaveProperty("missing link");
    expect(getLinks(renderLinks)).toEqual(links);
  });

  it('attaches a link to the link it points to', () => {
    let links = [
      [LinkPointer("a").hashableName, Link("foo", Endset("x", [LinkPointer("b")]))],
      [LinkPointer("b").hashableName, Link("bar")]
    ];

    let actual = RenderLinkFactory(makeEdlZettel(links)).renderLinks()[links[1][0]].modifiers;

    expect(actual).toHaveLength(1);
    expect(actual[0].pointer).toEqual(links[0][1].endsets[0].pointers[0]);
    expect(actual[0].renderEndset.endset).toEqual(links[0][1].endsets[0]);
    expect(actual[0].renderLink.link).toEqual(links[0][1]);
  });

  it('attaches a link to the link it points to, two levels', () => {
    let links = [
      [LinkPointer("a").hashableName, Link("foo", Endset("x", [LinkPointer("b")]))],
      [LinkPointer("b").hashableName, Link("foo", Endset(undefined, [LinkPointer("c")]))],
      [LinkPointer("c").hashableName, Link("foo")]
    ];

    let actual = RenderLinkFactory(makeEdlZettel(links)).renderLinks();

    expect(actual[links[2][0]].modifiers).toHaveLength(1);
    expect(actual[links[2][0]].modifiers[0].renderLink.link).toEqual(links[1][1]);
    expect(actual[links[1][0]].modifiers).toHaveLength(1);
    expect(actual[links[1][0]].modifiers[0].renderLink.link).toEqual(links[0][1]);
  });  
});
