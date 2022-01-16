import { describe, it, expect, test } from '@jest/globals';
import { Zettel, zettelTesting } from './zettel';
import { Span, Link, Endset, testing, LinkPointer, Part } from '@commonplace/core';
import { RenderLink } from './render-link';

let toEqualSpan = testing.spans.toEqualSpan;
let makeLinkPointer = () => LinkPointer("foo");
let addEndsets = zettelTesting.addEndsets;
let addEndset = zettelTesting.addEndset;
let addExistingEndsets = zettelTesting.addExistingEndsets;

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

describe('addEndset', () => {
  it('adds the given endsets', () => {
    let e1 = Endset("name1", [makeLinkPointer()]), e2 = Endset("name2", [makeLinkPointer()]);
    let l1 = makeLink("type1", e1), l2 = makeLink("type2", e2);

    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l2);

    expect(z.endsets[0]).toEqual(expect.objectContaining({name: e1.name, pointers: e1.pointers}));
    expect(z.endsets[1]).toEqual(expect.objectContaining({name: e2.name, pointers: e2.pointers}));
  });

  it('adds the links as properties to copies of the endsets', () => {
    let e1 = Endset("name1", [makeLinkPointer()]), e2 = Endset("name2", [makeLinkPointer()]);
    let l1 = makeLink("type1", e1), l2 = makeLink("type2", e2);

    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l2);

    expect(z.endsets[0].renderLink).toBe(l1);
    expect(z.endsets[1].renderLink).toBe(l2);
  });

  it('does not add link properties to the original endsets', () => {
    let e1 = Endset("name1", [makeLinkPointer()]), e2 = Endset("name2", [makeLinkPointer()]);
    let l1 = makeLink("type1", e1), l2 = makeLink("type2", e2);

    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l2);

    expect(e1).not.toHaveProperty("renderLink");
    expect(e2).not.toHaveProperty("renderLink");
  });

  it('adds the endset index property to copies of the endsets', () => {
    let e1 = Endset("name1", [makeLinkPointer()]), e2 = Endset("name2", [makeLinkPointer()]);
    let l1 = makeLink("type1", e1, e2);

    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l1);

    expect(z.endsets[0].index).toBe(0);
    expect(z.endsets[1].index).toBe(1);
  });

  it('does not add index property to the original endsets', () => {
    let e1 = Endset("name1", [makeLinkPointer()]), e2 = Endset("name2", [makeLinkPointer()]);
    let l1 = makeLink("type1", e1, e2);

    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l1);

    expect(e1).not.toHaveProperty("index");
    expect(e2).not.toHaveProperty("index");
  });

  it('will only add an endset once', () => {
    let e1 = Endset("name1", [makeLinkPointer()]);
    let l1 = makeLink("type1", e1);

    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e1, l1);

    expect(z.endsets.length).toBe(1);
  });

  it('will add a link twice if it is under different endsets', () => {
    let e1 = Endset("name1", [makeLinkPointer()]), e2 = Endset("name2", [makeLinkPointer()]);
    let l1 = makeLink("type1", e1, e2);

    let z = make();
    z.addEndset(e1, l1);
    z.addEndset(e2, l1);

    expect(z.endsets.length).toBe(2);
  });
});

describe('addLink', () => {
  it('creates a new zettel with the new link added', () => {
    let s = Span("origin", 1, 10);
    let e1 = Endset("name1", [s]);
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", Endset("name2", [s]));
    let zettel = make();
    zettel.addEndset(e1, l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel).toHaveLength(1);
    expect(newZettel[0].endsets).toHaveLength(2);
    expect(newZettel[0].endsets[0].renderLink).toBe(l2);
    expect(newZettel[0].endsets[1].renderLink).toBe(l1);
  });

  it('will split the zettel according to the link spans', () => {
    let s = Span("origin", 1, 10);
    let e1 = Endset("name1", [s]);
    let l1 = makeLink("type1", e1);
    let l2 = makeLink("type2", Endset("name2", [s.crop(1)]));
    let zettel = make();
    zettel.addEndset(e1, l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel).toHaveLength(2);

    expect(newZettel[0].endsets).toHaveLength(1);
    expect(newZettel[0].endsets[0].renderLink).toBe(l1);
    expect(newZettel[0].clip).toEqualSpan(s.crop(0, 1));

    expect(newZettel[1].endsets).toHaveLength(2);
    expect(newZettel[1].endsets[0].renderLink).toBe(l2);
    expect(newZettel[1].endsets[1].renderLink).toBe(l1);
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
    zettel.addEndset(e1, l1);
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
    zettel.addEndset(e1, l1);
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
    zettel.addEndset(e1, l1);

    let newZettel = zettel.addLink(l2);

    expect(newZettel[0].key).toBe(undefined);
    expect(newZettel[0].key).toBe(undefined);
  });
});

describe('renderEndsetsNotInOther', () => {
  it('returns all the endsets if the other is undefined', () => {
    let endset1 = Endset("bar1", [makeLinkPointer()]), endset2 = Endset("bar2", [makeLinkPointer()]);
    let link = makeLink("foo", endset1, endset2);
    let zettel = make();
    zettel.addEndset(endset1, link);
    zettel.addEndset(endset2, link);

    expect(zettel.renderEndsetsNotInOther(undefined)).toHaveLength(2);
  });

  it('returns an empty array if neither Zettel has any links', () => {
    expect(make().renderEndsetsNotInOther(make())).toHaveLength(0);
  });

  it('returns an empty array if both Zettel have the same endsets', () => {
    let endset = Endset("bar", [makeLinkPointer()]);
    let link = makeLink("foo", endset);
    let z1 = make(), z2 = make();
    z1.addEndset(endset, link);
    z2.addEndset(endset, link);

    expect(z1.renderEndsetsNotInOther(z2)).toHaveLength(0);
  });

  it('returns an endset if it is in this but not that', () => {
    let endset = Endset("bar", [makeLinkPointer()]);
    let link = makeLink("foo", endset);
    let z1 = make(), z2 = make();
    z1.addEndset(endset, link);

    expect(z1.renderEndsetsNotInOther(z2)).toHaveLength(1);
    expect(z1.renderEndsetsNotInOther(z2)[0]).toEqual(expect.objectContaining({ renderLink: link, index: 0 }));
  });

  it('does not return an endset if it is in that but not this', () => {
    let endset = Endset("bar", [makeLinkPointer()]);
    let link = makeLink("foo", endset);
    let z1 = make(), z2 = make();
    z2.addEndset(endset, link);

    expect(z1.renderEndsetsNotInOther(z2)).toHaveLength(0);
  });

  it('returns endset even if the link (but not the endset) is shared by both Zettel', () => {
    let endset1 = Endset("bar1", [makeLinkPointer()]), endset2 = Endset("bar2", [makeLinkPointer()]);
    let link = makeLink("foo", endset1, endset2);
    let z1 = make(), z2 = make();
    z1.addEndset(endset1, link);
    z2.addEndset(endset1, link);

    z1.addEndset(endset2, link);

    expect(z1.renderEndsetsNotInOther(z2)).toHaveLength(1);
    expect(z1.renderEndsetsNotInOther(z2)[0].name).toBe("bar2");
  });
});

describe('sharedRenderEndsets', () => {
  it('returns endsets that the two zettel have in common', () => {
    let endset1 = Endset("bar1", []), endset2 = Endset("bar2", []), endset3 = Endset("bar3", []), endset4 = Endset("bar4", []);
    let link = makeLink("foo", endset1, endset2, endset3);
    let z1 = make(), z2 = make();
    z1.addEndset(endset1, link);
    z1.addEndset(endset2, link);
    z1.addEndset(endset3, link);

    z2.addEndset(endset2, link);
    z2.addEndset(endset3, link);
    z2.addEndset(endset4, link);

    expect(z1.sharedRenderEndsets(z2)).toHaveLength(2);
    expect(z1.sharedRenderEndsets(z2).map(e => e.name)).toEqual(["bar2", "bar3"]);
  });
});

describe('sameRenderEndsets', () => {
  it('returns true if they both have no endsets', () => {
    expect(make().sameRenderEndsets(make())).toBeTruthy();
  });

  it('returns false if this has an endset and that doesnt', () => {
    let ths = make();
    addEndset(ths, "foo");
    expect(ths.sameRenderEndsets(make())).toBeFalsy();
  });

  it('returns false if that has an endset and this doesnt', () => {
    let that = make();
    addEndset(that, "foo");
    expect(make().sameRenderEndsets(that)).toBeFalsy();
  });

  it('returns true if they both have the same endset', () => {
    let ths = make(), that = make();
    let endset = addEndset(ths, "foo");
    addExistingEndsets(that, [endset]);
    expect(ths.sameRenderEndsets(that)).toBeTruthy();
  });

  it('returns true if they both have the same endsets', () => {
    let ths = make(), that = make();
    let endsets = addEndsets(ths, "foo", "bar", "baz");
    addExistingEndsets(that, endsets);
    expect(ths.sameRenderEndsets(that)).toBeTruthy();
  });
});

describe('style', () => {
  it('returns an empty array if there are no endsets', () => {
    expect(make().style()).toEqual([]);
  });

  it('returns the style of the endset', () => {
    let zettel = make();
    let endset = Endset(undefined, [makeLinkPointer()]);
    let link = makeLink("bold", endset);
    zettel.addEndset(endset, link);
    expect(zettel.style()[0]).toEqual({ bold: true });
  });

  it('returns an item for each endset', () => {
    let zettel = make();
    let endset1 = Endset(undefined, [makeLinkPointer()]), endset2 = Endset(undefined, [makeLinkPointer()]);
    let link1 = makeLink("bold", endset1);
    let link2 = makeLink("italic", endset2);
    zettel.addEndset(endset1, link1);
    zettel.addEndset(endset2, link2);
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
