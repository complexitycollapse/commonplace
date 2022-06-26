import { describe, it, expect, test } from '@jest/globals';
import { Zettel } from './zettel';
import { Link } from '@commonplace/core';
import { Span, testing, EdlPointer } from '@commonplace/core';
import { Part } from '@commonplace/core';
import { RenderLink } from './render-link';
import { EdlZettel, makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';

let toEqualSpan = testing.spans.toEqualSpan;
let makeSpan = start => Span("x", start ?? 1, 10);

expect.extend({
  toEqualSpan
});

function make(clip = Span("origin", 1, 10)) {
  return Zettel(clip, makeTestEdlAndEdlZettelFromLinks([]));
}

function makeLink(type, ...ends) {
  let link = Link(type, ...ends);
  return RenderLink("foo", link, makeTestEdlAndEdlZettelFromLinks([link]));
}

function getRenderPointers(zettel) {
  return zettel.renderPointers.renderPointers();
}

test('clip returns the passed clip', () => {
  let s = Span("a", 1, 2);
  expect(make(s).clip).toEqual(s);
});

describe('addPointer', () => {
  it('adds the given pointers as RenderPointers', () => {
    let p1 = Span("x", 1, 10), p2 = Span("x", 1, 10);
    let e1 = ["name1", [p1]], e2 = ["name2", [p2]];
    let l1 = makeLink("type1", e1), l2 = makeLink("type2", e2);

    let z = make(p1);
    z.addPointer(p1, l1.ends[0], l1);
    z.addPointer(p2, l2.ends[0], l2);

    let renderPointers = getRenderPointers(z);
    expect(renderPointers[0].pointer).toBe(p1);
    expect(renderPointers[1].pointer).toBe(p2);
  });

  it('adds RenderEnds to the RenderPointers', () => {
    let p1 = Span("x", 1, 10);
    let e1 = ["name1", [p1]];
    let l1 = makeLink("type1", e1);

    let z = make(p1);
    z.addPointer(p1, l1.ends[0], l1);

    expect(getRenderPointers(z)[0].renderEnd).toEqual(expect.objectContaining({name: e1[0], pointers: e1[1]}));
  });

  it('adds the links as properties to copies of the ends', () => {
    let p1 = Span("x", 1, 10);
    let e1 = ["name1", [p1]];
    let l1 = makeLink("type1", e1);

    let z = make(p1);
    z.addPointer(p1, l1.ends[0], l1);

    expect(getRenderPointers(z)[0].renderLink).toBe(l1);
  });

  it('adds the end index property to copies of the ends', () => {
    let p1 = Span("x", 1, 10), p2 = Span("x", 10, 10);
    let e1 = ["name1", [p1]], e2 = ["name2", [p2]];
    let l1 = makeLink("type1", e1, e2);

    let z = make(Span("x", 1, 20));
    z.addPointer(p1, l1.ends[0], l1);
    z.addPointer(p2, l1.ends[1], l1);

    let renderPointers = getRenderPointers(z);
    expect(renderPointers[0].renderEnd.index).toBe(0);
    expect(renderPointers[1].renderEnd.index).toBe(1);
  });

  it('will only add an end twice if it is added under different pointers', () => {
    let p1 = Span("x", 1, 10), p2 = Span("x", 10, 10);
    let e1 = ["name1", [p1, p2]];
    let l1 = makeLink("type1", e1);

    let z = make(Span("x", 1, 20));
    z.addPointer(p1, l1.ends[0], l1);
    z.addPointer(p2, l1.ends[0], l1);

    expect(getRenderPointers(z).length).toBe(2);
  });

  it('will add a link twice if it is under different ends', () => {
    let p1 = Span("x", 1, 10), p2 = Span("x", 10, 10);
    let e1 = ["name1", [p1]], e2 = ["name2", [p2]];
    let l1 = makeLink("type1", e1, e2);

    let z = make(Span("x", 1, 20));
    z.addPointer(p1, l1.ends[0], l1);
    z.addPointer(p2, l1.ends[1], l1);

    expect(getRenderPointers(z).length).toBe(2);
  });
});

describe('addLink', () => {
  it('creates a new zettel with the new link added', () => {
    let s = Span("origin", 1, 10);
    let e1 = ["name1", [s]];
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", ["name2", [s]]);
    let zettel = make();
    zettel.addPointer(s, l1.ends[0], l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel).toHaveLength(1);
    const renderPointers = getRenderPointers(newZettel[0]);
    expect(renderPointers).toHaveLength(2);
    expect(renderPointers[0].renderLink).toBe(l2);
    expect(renderPointers[1].renderLink).toBe(l1);
  });

  it('will split the zettel according to the link spans', () => {
    let s = Span("origin", 1, 10);
    let e1 = ["name1", [s]];
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", ["name2", [s.crop(1)]]);
    let zettel = make();
    zettel.addPointer(s, l1.ends[0], l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel).toHaveLength(2);

    const renderPointers0 = getRenderPointers(newZettel[0]);
    expect(renderPointers0).toHaveLength(1);
    expect(renderPointers0[0].renderLink).toBe(l1);
    expect(newZettel[0].clip).toEqualSpan(s.crop(0, 1));

    const renderPointers1 = getRenderPointers(newZettel[1]);
    expect(renderPointers1).toHaveLength(2);
    expect(renderPointers1[0].renderLink).toBe(l2);
    expect(renderPointers1[1].renderLink).toBe(l1);
    expect(newZettel[1].clip).toEqualSpan(s.crop(1, 9));
  });

  it('will split the zettel content to all the new zettel', () => {
    let s1 = Span("origin", 1, 20);
    let s2 = s1.crop(1);
    let e1 = ["name1", [s1]];
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", ["name2", [s2]]);
    let content = "This is some content";
    let zettel = make(s1);
    zettel.addPointer(s1, l1.ends[0], l1);
    zettel.tryAddPart(Part(s1, content));

    let newZettel = zettel.addLink(l2);

    expect(newZettel[0].part().content).toBe("T");
    expect(newZettel[1].part().content).toBe("his is some content");
    expect(newZettel[0].part().pointer).toEqual(Span("origin", 1, 1));
    expect(newZettel[1].part().pointer).toEqual(s2);
  });

  it('will assign keys to the new zettel if the original has a key', () => {
    let s = Span("origin", 1, 10);
    let e1 = ["name1", [s]];
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", ["name2", [s.crop(1)]]);
    let zettel = make();
    zettel.addPointer(s, l1.ends[0], l1);
    zettel.key = "xyz";

    let newZettel = zettel.addLink(l2);

    expect(newZettel[0].key).toBe("xyz.0");
    expect(newZettel[1].key).toBe("xyz.1");
  });

  it('will not assign keys to the new zettel if the original does not have a key', () => {
    let s = Span("origin", 1, 10);
    let e1 = ["name1", [s]];
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", ["name2", [s.crop(1)]]);
    let zettel = make();
    zettel.addPointer(s, l1.ends[0], l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel[0].key).toBe(undefined);
    expect(newZettel[0].key).toBe(undefined);
  });
});

describe('tryAddPart', () => {
  it('leaves the content undefined if the part does not engulf the zettel', () => {
    let zettel = make(Span("x", 1, 100));
    let part = Part(Span("x", 50, 100), "0123456789");

    zettel.tryAddPart(part);

    expect(zettel.part()).toBe(undefined);
  });

  it('assigns the correct portion of the parts content if the part engulfs the zettel', () => {
    let zettel = make(Span("x", 204, 3));
    let part = Part(Span("x", 200, 10), "0123456789");

    zettel.tryAddPart(part);

    expect(zettel.part().pointer).toEqual(Span("x", 204, 3));
  });

  it('assigns the part the overlapping content if the part engulfs the zettel', () => {
    let zettel = make(Span("x", 204, 3));
    let part = Part(Span("x", 200, 10), "0123456789");

    zettel.tryAddPart(part);

    expect(zettel.part().content).toBe("456");
  });
});

describe('containingEdl', () => {
  it('is set on the zettel', () => {
    let expectedContainingEdl = EdlZettel(EdlPointer("foo"), undefined, undefined, "1");
    expect(Zettel(makeSpan(), expectedContainingEdl).containingEdl).toBe(expectedContainingEdl);
  });
});
