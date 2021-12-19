import { describe, it, expect } from '@jest/globals';
import { ZettelSchneider } from './zettel-schneider';
import { Span, Box, testing } from '@commonplace/core';
import { RenderLink } from './render-link';
import { zettelTesting } from './zettel';

let toEqualClip = testing.clips.toEqualClip;
let makeSpanLink = (...args) =>
  RenderLink(testing.links.makeSpanLink.call(null, ...args));

let hasEndset = zettelTesting.hasEndset;

expect.extend({
  toEqualClip,
  hasEndset,
  hasZettelProperties(zettel, start, length, ...endsets) {
    endsets = endsets ?? [];

    if (zettel.clip.start !== start) {
      return {
        message: () => `expected zettel to start at ${start}, actual ${zettel.clip.start}`,
        pass: false
      };
    }

    if (zettel.clip.start !== start) {
      return {
        message: () => `expected zettel to have length at ${length}, actual ${zettel.clip.length}`,
        pass: false
      };
    }

    endsets.forEach(e => {
      let result = hasEndset(zettel, e[0], e[1]);
      if (!result.pass) { return result; }
    });

    if (endsets.length !== zettel.endsets.length) {
      return {
        message: () => `expected ${endsets.length} endsets, received ${zettel.endsets.length}`,
        pass: false
      }
    }

    return {
      message: () => 'did not expect zettel to have given properties',
      pass: true
    };
  }
});

describe('zettel', () => {
  it('returns a single zettel if the clip is a box', () => {
    let box = Box("origin", 0, 0, 10, 10);
    let l = makeSpanLink({ clipLists: [[Box("origin", 5, 5, 20, 20)]] });

    expect(ZettelSchneider(box, [l]).zettel()).toHaveLength(1);
  });

  it('assigns a key to the returned zettel if a keyPrefix is passed', () => {
    let box = Box("origin", 0, 0, 10, 10);
    let l = makeSpanLink({ clipLists: [[Box("origin", 5, 5, 20, 20)]] });

    expect(ZettelSchneider(box, [l], "abc").zettel()[0].key).toBe("abc.0");
  });

  it('does not assign a key to the returned zettel if no keyPrefix is passed', () => {
    let box = Box("origin", 0, 0, 10, 10);
    let l = makeSpanLink({ clipLists: [[Box("origin", 5, 5, 20, 20)]] });

    expect(ZettelSchneider(box, [l], undefined).zettel()[0].key).toBe(undefined);
  });

  it('returns a single zettel if the clip is a span and there are no links', () => {
    let s = Span("origin", 0, 10);

    expect(ZettelSchneider(s, []).zettel()).toHaveLength(1);
  });

  it('attaches an endset to a box that overlaps with it', () => {
    let box = Box("origin", 0, 0, 10, 10);
    let l = makeSpanLink({ clipLists: [[Box("origin", 5, 5, 20, 20)]] });

    let zettel = ZettelSchneider(box, [l]).zettel();

    expect(zettel[0]).hasEndset(l, 0);
  });

  it('does not attach an endset to a box that does not overlap with it', () => {
    let box = Box("origin", 100, 100, 10, 10);
    let l = makeSpanLink({ clipLists: [[Box("origin", 5, 5, 20, 20)]] });

    let zettel = ZettelSchneider(box, [l]).zettel();

    expect(zettel[0]).not.hasEndset(l, 0);
  });

  it('attaches an endset to a span that overlaps with it', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 0, 20)]] });

    let zettel = ZettelSchneider(s, [l]).zettel();

    expect(zettel[0]).hasEndset(l, 0);
  });

  it('does not attach an endset to a span that does not overlap with it', () => {
    let s = Span("origin", 100, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 0, 20)]] });

    let zettel = ZettelSchneider(s, [l]).zettel();

    expect(zettel[0]).not.hasEndset(l, 0);
  });

  it('splits a span if only the end is covered by a link', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 5, 5)]] });

    let zettel = ZettelSchneider(s, [l]).zettel();

    expect(zettel).toHaveLength(2);
    expect(zettel[0]).not.hasEndset(l, 0);
    expect(zettel[1]).hasEndset(l, 0);
  });

  it('splits a span at link start if only the end is covered by a link', () => {
    let s = Span("origin", 1, 10);
    let endsetSpan = Span("origin", 6, 20);
    let l = makeSpanLink({ clipLists: [[endsetSpan]] });

    let zettel = ZettelSchneider(s, [l]).zettel();

    expect(zettel).toHaveLength(2);
    expect(zettel[0].clip).toEqualClip(Span(s.origin, s.start, 5));
    expect(zettel[1].clip).toEqualClip(Span(s.origin, endsetSpan.start, 5));
    expect(zettel.reduce((n, z) => n + z.clip.length, 0)).toBe(s.length);
  });

  it('splits a span if only the start is covered by a link', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 0, 5)]] });

    let zettel = ZettelSchneider(s, [l]).zettel();

    expect(zettel).toHaveLength(2);
    expect(zettel[0]).hasEndset(l, 0);
    expect(zettel[1]).not.hasEndset(l, 0);
  });

  it('splits a span at span start if only the end is covered by a link', () => {
    let s = Span("origin", 1, 10);
    let endsetSpan = Span("origin", 0, 6);
    let l = makeSpanLink({ clipLists: [[endsetSpan]] });

    let zettel = ZettelSchneider(s, [l]).zettel();

    expect(zettel).toHaveLength(2);
    expect(zettel[0].clip).toEqualClip(Span(s.origin, s.start, 5));
    expect(zettel[1].clip).toEqualClip(Span(s.origin, 6, 5));
    expect(zettel.reduce((n, z) => n + z.clip.length, 0)).toBe(s.length);
  });

  it('splits a span twice if the link is fully contained in the span', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 1, 8)]] });

    let zettel = ZettelSchneider(s, [l]).zettel();

    expect(zettel).toHaveLength(3);
    expect(zettel[0]).not.hasEndset(l, 0);
    expect(zettel[1]).hasEndset(l, 0);
    expect(zettel[2]).not.hasEndset(l, 0);
  });

  it('splits a span at the link points if the link is contained in the span', () => {
    let s = Span("origin", 1, 10);
    let endsetSpan = Span("origin", 2, 8);
    let l = makeSpanLink({ clipLists: [[endsetSpan]] });

    let zettel = ZettelSchneider(s, [l]).zettel();

    expect(zettel).toHaveLength(3);
    expect(zettel[0].clip).toEqualClip(Span(s.origin, s.start, 1));
    expect(zettel[1].clip).toEqualClip(Span(s.origin, endsetSpan.start, endsetSpan.length));
    expect(zettel[2].clip).toEqualClip(Span(s.origin, endsetSpan.next, 1));
    expect(zettel.reduce((n, z) => n + z.clip.length, 0)).toBe(s.length);
  });

  it('assigns all endsets that overlap the zettel', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 0, 10)], [Span("origin", 0, 10)]] });

    let zettel = ZettelSchneider(s, [l]).zettel();

    expect(zettel).toHaveLength(1);
    expect(zettel[0]).hasEndset(l, 0);
    expect(zettel[0]).hasEndset(l, 1);
  });

  it('assigns all links that overlap the zettel', () => {
    let s = Span("origin", 0, 10);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 0, 10)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 0, 10)]] });

    let zettel = ZettelSchneider(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(1);
    expect(zettel[0]).hasEndset(l1, 0);
    expect(zettel[0]).hasEndset(l2, 0);
  });

  it('assigns a link once even if there are multiple overlapping spans', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 0, 10), Span("origin", 0, 10)]] });

    let zettel = ZettelSchneider(s, [l]).zettel();

    expect(zettel[0].endsets).toHaveLength(1);
  });

  it('assigns links only to the spans that overlap them', () => {
    let s = Span("origin", 1, 10);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 10)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 20, 10)]] });

    let zettel = ZettelSchneider(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(1);
    expect(zettel[0]).hasEndset(l1, 0);
  });

  it('will split a span by two different abutting links', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 10)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 10)]] });

    let zettel = ZettelSchneider(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(2);
    expect(zettel[0]).hasZettelProperties(1, 10, [l1, 0]);
    expect(zettel[1]).hasZettelProperties(11, 10, [l2, 0]);
  });

  it('will split a span by two different non-overlapping, non-abutting links', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 10)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 12, 10)]] });

    let zettel = ZettelSchneider(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(3);
    expect(zettel[0]).hasZettelProperties(1, 10, [l1, 0]);
    expect(zettel[1]).hasZettelProperties(11, 1);
    expect(zettel[2]).hasZettelProperties(12, 10, [l2, 0]);
  });

  it('will split a span by two overlapping links', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 15)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 10)]] });

    let zettel = ZettelSchneider(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(3);
    expect(zettel[0]).hasZettelProperties(1, 10, [l1, 0]);
    expect(zettel[1]).hasZettelProperties(11, 5, [l1, 0], [l2, 0]);
    expect(zettel[2]).hasZettelProperties(16, 5, [l2, 0]);
  });

  it('will assign consecutive sub-keys to all created zettel', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 15)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 10)]] });

    let zettel = ZettelSchneider(s, [l1, l2], "1").zettel();

    expect(zettel[0].key).toBe("1.0");
    expect(zettel[1].key).toBe("1.1");
    expect(zettel[2].key).toBe("1.2");
  });

  it('will split a span by two overlapping links with space on either side of the links', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 2, 15)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 9)]] });

    let zettel = ZettelSchneider(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(5);
    expect(zettel[0]).hasZettelProperties(1, 1);
    expect(zettel[1]).hasZettelProperties(2, 10, [l1, 0]);
    expect(zettel[2]).hasZettelProperties(11, 5, [l1, 0], [l2, 0]);
    expect(zettel[3]).hasZettelProperties(17, 3, [l2, 0]);
    expect(zettel[4]).hasZettelProperties(20, 1);
  });

  it('will split a span by two links when one is contained in the other', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 20)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 5)]] });

    let zettel = ZettelSchneider(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(3);
    expect(zettel[0]).hasZettelProperties(1, 10, [l1, 0]);
    expect(zettel[1]).hasZettelProperties(11, 5, [l1, 0], [l2, 0]);
    expect(zettel[2]).hasZettelProperties(16, 5, [l1, 0]);
  });

  it('will split a span by two links when one link is contained in the other with space on either side', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 2, 18)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 4)]] });

    let zettel = ZettelSchneider(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(5);
    expect(zettel[0]).hasZettelProperties(1, 1);
    expect(zettel[1]).hasZettelProperties(2, 9, [l1, 0]);
    expect(zettel[2]).hasZettelProperties(11, 4, [l1, 0], [l2, 0]);
    expect(zettel[3]).hasZettelProperties(15, 5, [l1, 0]);
    expect(zettel[4]).hasZettelProperties(20, 1);
  });
});
