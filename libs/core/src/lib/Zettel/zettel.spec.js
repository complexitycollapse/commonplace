import { describe, it, expect, test } from '@jest/globals';
import { Zettel } from './zettel';
import { Endset, Link } from '../model';
import { Span, spanTesting, LinkPointer, EdlPointer } from '../pointers';
import { Part } from '../part';
import { RenderLink } from './render-link';
import { EdlZettel } from './edl-zettel';

let toEqualSpan = spanTesting.toEqualSpan;
let makeLinkPointer = () => LinkPointer("foo");
let makeSpan = start => Span("x", start ?? 1, 10);

expect.extend({
  toEqualSpan
});

function make(clip = Span("origin", 1, 10)) {
  return Zettel(clip);
}

function makeLink(type, ...endsets) {
  return RenderLink(Link(type, ...endsets));
}

test('clip returns the passed clip', () => {
  let s = Span("a", 1, 2);
  expect(make(s).clip).toEqual(s);
});

describe('addPointer', () => {
  it('adds the given pointers as RenderPointers', () => {
    let p1 = Span("x", 1, 10), p2 = LinkPointer("foo");
    let e1 = Endset("name1", [p1]), e2 = Endset("name2", [p2]);
    let l1 = makeLink("type1", e1), l2 = makeLink("type2", e2);

    let z = make();
    z.addPointer(p1, e1, l1);
    z.addPointer(p2, e2, l2);

    expect(z.renderPointers[0].pointer).toBe(p1);
    expect(z.renderPointers[1].pointer).toBe(p2);
  });

  it('adds RenderEndsets to the RenderPointers', () => {
    let p1 = Span("x", 1, 10), p2 = LinkPointer("foo");
    let e1 = Endset("name1", [p1]), e2 = Endset("name2", [p2]);
    let l1 = makeLink("type1", e1), l2 = makeLink("type2", e2);

    let z = make();
    z.addPointer(p1, e1, l1);
    z.addPointer(p2, e2, l2);

    expect(z.renderPointers[0].renderEndset).toEqual(expect.objectContaining({name: e1.name, pointers: e1.pointers}));
    expect(z.renderPointers[1].renderEndset).toEqual(expect.objectContaining({name: e2.name, pointers: e2.pointers}));
  });

  it('adds the links as properties to copies of the endsets', () => {
    let p1 = Span("x", 1, 10), p2 = LinkPointer("foo");
    let e1 = Endset("name1", [p1]), e2 = Endset("name2", [p2]);
    let l1 = makeLink("type1", e1), l2 = makeLink("type2", e2);

    let z = make();
    z.addPointer(p1, e1, l1);
    z.addPointer(p2, e2, l2);

    expect(z.renderPointers[0].renderLink).toBe(l1);
    expect(z.renderPointers[1].renderLink).toBe(l2);
  });

  it('adds the endset index property to copies of the endsets', () => {
    let p1 = Span("x", 1, 10), p2 = LinkPointer("foo");
    let e1 = Endset("name1", [p1]), e2 = Endset("name2", [p2]);
    let l1 = makeLink("type1", e1, e2);

    let z = make();
    z.addPointer(p1, e1, l1);
    z.addPointer(p2, e2, l1);

    expect(z.renderPointers[0].renderEndset.index).toBe(0);
    expect(z.renderPointers[1].renderEndset.index).toBe(1);
  });

  it('will only add an endset once, even if it is added under different pointers', () => {
    let p1 = makeLinkPointer(), p2 = makeLinkPointer();
    let e1 = Endset("name1", [p1, p2]);
    let l1 = makeLink("type1", e1);

    let z = make();
    z.addPointer(p1, e1, l1);
    z.addPointer(p2, e1, l1);

    expect(z.renderPointers.length).toBe(1);
  });

  it('will add a link twice if it is under different endsets', () => {
    let p1 = makeLinkPointer(), p2 = makeLinkPointer();
    let e1 = Endset("name1", [p1]), e2 = Endset("name2", [p2]);
    let l1 = makeLink("type1", e1, e2);

    let z = make();
    z.addPointer(p1, e1, l1);
    z.addPointer(p2, e2, l1);

    expect(z.renderPointers.length).toBe(2);
  });
});

describe('addLink', () => {
  it('creates a new zettel with the new link added', () => {
    let s = Span("origin", 1, 10);
    let e1 = Endset("name1", [s]);
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", Endset("name2", [s]));
    let zettel = make();
    zettel.addPointer(s, e1, l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel).toHaveLength(1);
    expect(newZettel[0].renderPointers).toHaveLength(2);
    expect(newZettel[0].renderPointers[0].renderLink).toBe(l2);
    expect(newZettel[0].renderPointers[1].renderLink).toBe(l1);
  });

  it('will split the zettel according to the link spans', () => {
    let s = Span("origin", 1, 10);
    let e1 = Endset("name1", [s]);
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", Endset("name2", [s.crop(1)]));
    let zettel = make();
    zettel.addPointer(s, e1, l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel).toHaveLength(2);

    expect(newZettel[0].renderPointers).toHaveLength(1);
    expect(newZettel[0].renderPointers[0].renderLink).toBe(l1);
    expect(newZettel[0].clip).toEqualSpan(s.crop(0, 1));

    expect(newZettel[1].renderPointers).toHaveLength(2);
    expect(newZettel[1].renderPointers[0].renderLink).toBe(l2);
    expect(newZettel[1].renderPointers[1].renderLink).toBe(l1);
    expect(newZettel[1].clip).toEqualSpan(s.crop(1, 9));
  });

  it('will split the zettel content to all the new zettel', () => {
    let s1 = Span("origin", 1, 20);
    let s2 = s1.crop(1);
    let e1 = Endset("name1", [s1]);
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", Endset("name2", [s2]));
    let content = "This is some content";
    let zettel = make(s1);
    zettel.addPointer(s1, e1, l1);
    zettel.tryAddPart(Part(s1, content));

    let newZettel = zettel.addLink(l2);

    expect(newZettel[0].part().content).toBe("T");
    expect(newZettel[1].part().content).toBe("his is some content");
    expect(newZettel[0].part().pointer).toEqual(Span("origin", 1, 1));
    expect(newZettel[1].part().pointer).toEqual(s2);
  });

  it('will assign keys to the new zettel if the original has a key', () => {
    let s = Span("origin", 1, 10);
    let e1 = Endset("name1", [s]);
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", Endset("name2", [s.crop(1)]));
    let zettel = make();
    zettel.addPointer(s, e1, l1);
    zettel.key = "xyz";

    let newZettel = zettel.addLink(l2);

    expect(newZettel[0].key).toBe("xyz.0");
    expect(newZettel[1].key).toBe("xyz.1");
  });

  it('will not assign keys to the new zettel if the original does not have a key', () => {
    let s = Span("origin", 1, 10);
    let e1 = Endset("name1", [s]);
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", Endset("name2", [s.crop(1)]));
    let zettel = make();
    zettel.addPointer(s, e1, l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel[0].key).toBe(undefined);
    expect(newZettel[0].key).toBe(undefined);
  });
});

describe('style', () => {
  it('returns an empty array if there are no endsets', () => {
    expect(make().style()).toEqual([]);
  });

  it('returns the style of the endset', () => {
    let zettel = make();
    let span = makeSpan();
    let endset = Endset(undefined, []);
    let link = makeLink("bold", endset);
    zettel.addPointer(span, endset, link);
    expect(zettel.style()[0]).toEqual({ bold: true });
  });

  it('returns an item for each endset', () => {
    let zettel = make();
    let span1 = makeSpan(1), span2 = makeSpan(100);
    let endset1 = Endset(undefined, [span1]), endset2 = Endset(undefined, [span2]);
    let link1 = makeLink("bold", endset1);
    let link2 = makeLink("italic", endset2);
    zettel.addPointer(span1, endset1, link1);
    zettel.addPointer(span2, endset2, link2);
    expect(zettel.style()[0]).toEqual({ bold: true });
    expect(zettel.style()[1]).toEqual({ italic: true });
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

describe('parent', () => {
  it('is set on the zettel', () => {
    let expectedParent = EdlZettel(EdlPointer("foo"), undefined, "1");
    expect(Zettel(makeSpan(), expectedParent).parent).toBe(expectedParent);
  });
});
