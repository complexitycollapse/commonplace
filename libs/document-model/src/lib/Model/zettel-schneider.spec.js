import { describe, it, expect } from '@jest/globals';
import { ZettelSchneider } from './zettel-schneider';
import { testing, Span, Box } from '@commonplace/core';
import { RenderLink } from './render-link';
import { zettelTesting } from './zettel';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';

let makeSpanLink = (...args) => {
  let link = testing.links.makeSpanLink.call(null, ...args);
  return RenderLink("foo", link, makeTestEdlAndEdlZettelFromLinks([link]));
}

let hasEnd = zettelTesting.hasEnd;
let toEqualClip = testing.toEqualClip;

function make(clip, renderLinks, key) {
  return ZettelSchneider(clip, renderLinks, key, makeTestEdlAndEdlZettelFromLinks([]));
}

expect.extend({
  toEqualClip,
  hasEnd: hasEnd,
  hasZettelProperties(zettel, start, length, ...ends) {
    ends = ends ?? [];

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

    ends.forEach(e => {
      let result = hasEnd(zettel, e[0], e[1]);
      if (!result.pass) { return result; }
    });

    if (ends.length !== zettel.renderPointers().length) {
      return {
        message: () => `expected ${ends.length} ends, received ${zettel.renderPointers().length}`,
        pass: false
      }
    }

    return {
      message: () => 'did not expect zettel to have given properties',
      pass: true
    };
  }
});

describe('ZettelSchneider.zettel', () => {
  it('returns a single zettel if the clip is a box', () => {
    let box = Box("origin", 0, 0, 10, 10);
    let l = makeSpanLink({ clipLists: [[Box("origin", 5, 5, 20, 20)]] });

    expect(make(box, [l]).zettel()).toHaveLength(1);
  });

  it('assigns a key to the returned zettel if a keyPrefix is passed', () => {
    let box = Box("origin", 0, 0, 10, 10);
    let l = makeSpanLink({ clipLists: [[Box("origin", 5, 5, 20, 20)]] });

    expect(make(box, [l], "abc").zettel()[0].key).toBe("abc.0");
  });

  it('does not assign a key to the returned zettel if no keyPrefix is passed', () => {
    let box = Box("origin", 0, 0, 10, 10);
    let l = makeSpanLink({ clipLists: [[Box("origin", 5, 5, 20, 20)]] });

    expect(make(box, [l], undefined).zettel()[0].key).toBe(undefined);
  });

  it('returns a single zettel if the clip is a span and there are no links', () => {
    let s = Span("origin", 0, 10);

    expect(make(s, []).zettel()).toHaveLength(1);
  });

  it('attaches an end to a box that overlaps with it', () => {
    let box = Box("origin", 0, 0, 10, 10);
    let l = makeSpanLink({ clipLists: [[Box("origin", 5, 5, 20, 20)]] });

    let zettel = make(box, [l]).zettel();

    expect(zettel[0]).hasEnd(l, 0);
  });

  it('does not attach an end to a box that does not overlap with it', () => {
    let box = Box("origin", 100, 100, 10, 10);
    let l = makeSpanLink({ clipLists: [[Box("origin", 5, 5, 20, 20)]] });

    let zettel = make(box, [l]).zettel();

    expect(zettel[0]).not.hasEnd(l, 0);
  });

  it('attaches an end to a span that overlaps with it', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 0, 20)]] });

    let zettel = make(s, [l]).zettel();

    expect(zettel[0]).hasEnd(l, 0);
  });

  it('does not attach an end to a span that does not overlap with it', () => {
    let s = Span("origin", 100, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 0, 20)]] });

    let zettel = make(s, [l]).zettel();

    expect(zettel[0]).not.hasEnd(l, 0);
  });

  it('splits a span if only the end is covered by a link', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 5, 5)]] });

    let zettel = make(s, [l]).zettel();

    expect(zettel).toHaveLength(2);
    expect(zettel[0]).not.hasEnd(l, 0);
    expect(zettel[1]).hasEnd(l, 0);
  });

  it('splits a span at link start if only the end is covered by a link', () => {
    let s = Span("origin", 1, 10);
    let endSpan = Span("origin", 6, 20);
    let l = makeSpanLink({ clipLists: [[endSpan]] });

    let zettel = make(s, [l]).zettel();

    expect(zettel).toHaveLength(2);
    expect(zettel[0].clip).toEqualClip(Span(s.origin, s.start, 5));
    expect(zettel[1].clip).toEqualClip(Span(s.origin, endSpan.start, 5));
    expect(zettel.reduce((n, z) => n + z.clip.length, 0)).toBe(s.length);
  });

  it('splits a span if only the start is covered by a link', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 0, 5)]] });

    let zettel = make(s, [l]).zettel();

    expect(zettel).toHaveLength(2);
    expect(zettel[0]).hasEnd(l, 0);
    expect(zettel[1]).not.hasEnd(l, 0);
  });

  it('splits a span at span start if only the end is covered by a link', () => {
    let s = Span("origin", 1, 10);
    let endSpan = Span("origin", 0, 6);
    let l = makeSpanLink({ clipLists: [[endSpan]] });

    let zettel = make(s, [l]).zettel();

    expect(zettel).toHaveLength(2);
    expect(zettel[0].clip).toEqualClip(Span(s.origin, s.start, 5));
    expect(zettel[1].clip).toEqualClip(Span(s.origin, 6, 5));
    expect(zettel.reduce((n, z) => n + z.clip.length, 0)).toBe(s.length);
  });

  it('splits a span twice if the link is fully contained in the span', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 1, 8)]] });

    let zettel = make(s, [l]).zettel();

    expect(zettel).toHaveLength(3);
    expect(zettel[0]).not.hasEnd(l, 0);
    expect(zettel[1]).hasEnd(l, 0);
    expect(zettel[2]).not.hasEnd(l, 0);
  });

  it('splits a span at the link points if the link is contained in the span', () => {
    let s = Span("origin", 1, 10);
    let endSpan = Span("origin", 2, 8);
    let l = makeSpanLink({ clipLists: [[endSpan]] });

    let zettel = make(s, [l]).zettel();

    expect(zettel).toHaveLength(3);
    expect(zettel[0].clip).toEqualClip(Span(s.origin, s.start, 1));
    expect(zettel[1].clip).toEqualClip(Span(s.origin, endSpan.start, endSpan.length));
    expect(zettel[2].clip).toEqualClip(Span(s.origin, endSpan.next, 1));
    expect(zettel.reduce((n, z) => n + z.clip.length, 0)).toBe(s.length);
  });

  it('assigns all ends that overlap the zettel', () => {
    let s = Span("origin", 0, 10);
    let l = makeSpanLink({ clipLists: [[Span("origin", 0, 10)], [Span("origin", 0, 10)]] });

    let zettel = make(s, [l]).zettel();

    expect(zettel).toHaveLength(1);
    expect(zettel[0]).hasEnd(l, 0);
    expect(zettel[0]).hasEnd(l, 1);
  });

  it('assigns all links that overlap the zettel', () => {
    let s = Span("origin", 0, 10);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 0, 10)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 0, 10)]] });

    let zettel = make(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(1);
    expect(zettel[0]).hasEnd(l1, 0);
    expect(zettel[0]).hasEnd(l2, 0);
  });

  it('assigns links only to the spans that overlap them', () => {
    let s = Span("origin", 1, 10);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 10)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 20, 10)]] });

    let zettel = make(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(1);
    expect(zettel[0]).hasEnd(l1, 0);
  });

  it('will split a span by two different abutting links', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 10)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 10)]] });

    let zettel = make(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(2);
    expect(zettel[0]).hasZettelProperties(1, 10, [l1, 0]);
    expect(zettel[1]).hasZettelProperties(11, 10, [l2, 0]);
  });

  it('will split a span by two different non-overlapping, non-abutting links', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 10)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 12, 10)]] });

    let zettel = make(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(3);
    expect(zettel[0]).hasZettelProperties(1, 10, [l1, 0]);
    expect(zettel[1]).hasZettelProperties(11, 1);
    expect(zettel[2]).hasZettelProperties(12, 10, [l2, 0]);
  });

  it('will split a span by two overlapping links', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 15)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 10)]] });

    let zettel = make(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(3);
    expect(zettel[0]).hasZettelProperties(1, 10, [l1, 0]);
    expect(zettel[1]).hasZettelProperties(11, 5, [l1, 0], [l2, 0]);
    expect(zettel[2]).hasZettelProperties(16, 5, [l2, 0]);
  });

  it('will assign consecutive sub-keys to all created zettel', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 1, 15)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 10)]] });

    let zettel = make(s, [l1, l2], "1").zettel();

    expect(zettel[0].key).toBe("1.0");
    expect(zettel[1].key).toBe("1.1");
    expect(zettel[2].key).toBe("1.2");
  });

  it('will split a span by two overlapping links with space on either side of the links', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 2, 15)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 9)]] });

    let zettel = make(s, [l1, l2]).zettel();

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

    let zettel = make(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(3);
    expect(zettel[0]).hasZettelProperties(1, 10, [l1, 0]);
    expect(zettel[1]).hasZettelProperties(11, 5, [l1, 0], [l2, 0]);
    expect(zettel[2]).hasZettelProperties(16, 5, [l1, 0]);
  });

  it('will split a span by two links when one link is contained in the other with space on either side', () => {
    let s = Span("origin", 1, 20);
    let l1 = makeSpanLink({ clipLists: [[Span("origin", 2, 18)]] });
    let l2 = makeSpanLink({ clipLists: [[Span("origin", 11, 4)]] });

    let zettel = make(s, [l1, l2]).zettel();

    expect(zettel).toHaveLength(5);
    expect(zettel[0]).hasZettelProperties(1, 1);
    expect(zettel[1]).hasZettelProperties(2, 9, [l1, 0]);
    expect(zettel[2]).hasZettelProperties(11, 4, [l1, 0], [l2, 0]);
    expect(zettel[3]).hasZettelProperties(15, 5, [l1, 0]);
    expect(zettel[4]).hasZettelProperties(20, 1);
  });
});
