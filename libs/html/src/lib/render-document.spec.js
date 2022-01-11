import { expect, describe, it, test } from '@jest/globals';
import { testing, Doc, Span, LinkPointer } from "@commonplace/core";
import { zettelTesting } from './zettel';
import { RenderDocument } from './render-document';

let makeSpanLink = testing.links.makeSpanLink;

expect.extend({
  hasEndset: zettelTesting.hasEndset
});

function makeDoc(clips, linkNames) {
  return Doc(clips, linkNames.map(n => LinkPointer(n, undefined)));
}

function makeRenderDocWithLinks(doc, links) {
  let rd = RenderDocument(doc);
  links.forEach((l, i) => rd.resolveLink(LinkPointer(i.toString()), l));
  return rd;
}

test('if no arguments are passed then assume an empty document', () => {
  let renderDoc = RenderDocument();

  let zettelTree = renderDoc.zettelTree();

  expect(zettelTree.children).toEqual([]);
  expect(zettelTree.endsets).toEqual([]);
});

describe('zettelTree', () => {
  it('assigns all links that overlap the zettel', () => {
    let s = Span("origin", 0, 10);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 0, 10)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 0, 10)]] });
    let doc = makeDoc([s], ["0", "1"]);

    let zettelTree = makeRenderDocWithLinks(doc, [l1, l2]).zettelTree();
    let zettel = zettelTree.children;

    expect(zettel).toHaveLength(1);
    expect(zettel[0]).hasEndset(l1, 0);
    expect(zettel[0]).hasEndset(l2, 0);
  });
});