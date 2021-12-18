import { describe, it, expect } from '@jest/globals';
import { testing, Doc, Span, Endset, Link } from "@commonplace/core";
import { DocumentRenderElements } from './document-render-elements';
import { zettelTesting } from './zettel';

let makeSpanLink = testing.links.makeSpanLink;

expect.extend({
  hasEndset: zettelTesting.hasEndset
});

describe('zettel', () => {
  it('assigns all links that overlap the zettel', () => {
    let s = Span("origin", 0, 10);
    let l1 = makeSpanLink({ editLists: [[Span("origin", 0, 10)]] });
    let l2 = makeSpanLink({ editLists: [[Span("origin", 0, 10)]] });
    let doc = Doc([s], ["a", "b"]);

    let zettel = DocumentRenderElements(doc, [l1, l2]).zettel();

    expect(zettel).toHaveLength(1);
    expect(zettel[0]).hasEndset(l1, 0);
    expect(zettel[0]).hasEndset(l2, 0);
  });
});

describe('fragmentTree', () => {
  it('returns a fragment tree containing all the valid fragment links', () => {
    let link1 = Link("paragraph", Endset(undefined, [Span("or", 1, 10)]));
    let link2 = Link("paragraph", Endset(undefined, [Span("or", 2, 5)]));
    let doc = Doc([Span("or", 0, 100)], ["a", "b"]);

    let actual = DocumentRenderElements(doc, [link1, link2]).fragmentTree();

    expect(actual.children[0].renderLink.link).toEqual(link1);
    expect(actual.children[0].children[0].renderLink.link).toEqual(link2);
    // arranging links in a hierarchy
  });

  it('only adds fragments for pointers that overlap with the document', () => {
    let link1 = Link("paragraph", Endset(undefined, [Span("or", 1, 10)]));
    let link2 = Link("paragraph", Endset(undefined, [Span("or", 11, 10)]));
    let doc = Doc([Span("or", 0, 5)], ["a", "b"]);

    let actual = DocumentRenderElements(doc, [link1, link2]).fragmentTree();

    expect(actual.children).toHaveLength(1);
    expect(actual.children[0].renderLink.link).toEqual(link1);
  });

  it('does not return fragments that overlap with each other', () => {
    let link1 = Link("paragraph", Endset(undefined, [Span("or", 1, 10)]));
    let link2 = Link("paragraph", Endset(undefined, [Span("or", 5, 10)]));
    let doc = Doc([Span("or", 0, 100)], ["a", "b"]);

    let actual = DocumentRenderElements(doc, [link1, link2]).fragmentTree();

    expect(actual.children).toHaveLength(0);
  });

  it('adds overlapping structural links to the overlapping collection', () => {
    let span1 = Span("or", 1, 10), span2 = Span("or", 5, 10);
    let link1 = Link("paragraph", Endset(undefined, [span1]));
    let link2 = Link("paragraph", Endset(undefined, [span2]));
    let doc = Doc([Span("or", 0, 100)], ["a", "b"]);

    let actual = DocumentRenderElements(doc, [link1, link2]).overlappingLinks();

    expect(actual.map(f => f.edit)).toEqual([span1, span2]);
  });
});
