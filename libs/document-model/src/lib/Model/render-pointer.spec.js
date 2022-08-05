import { describe, expect, it } from '@jest/globals';
import { makeTestEdlZettelWithLinks } from './edl-zettel';
import { Link, testing, Edl, LinkPointer, EdlPointer, Part } from '@commonplace/core';

const make = makeTestEdlZettelWithLinks;
const makeSpan = testing.spans.makeSpan;

describe('comparePriority', () => {
  function makePointers(linkFn) {
    let span = makeSpan();
    let links = linkFn([span]);
    let linkPointers = links.map(l => LinkPointer(l.type));
    let edlZ = make(Edl(undefined, [span], linkPointers), links);
    let pointers = edlZ.children.map(z => z.renderPointers()).flat();
    return pointers;
  }

  function sortPointers(pointers) {
    return pointers.sort((a, b) => a.comparePriority(b));
  }

  it('returns 0 when a pointer is compared to itself', () => {
    let [pointer] = makePointers(s => [Link("1", [undefined, s])]);

    expect(pointer.comparePriority(pointer)).toBe(0);
  });

  it('sorts a later before an earlier pointer', () => {
    let pointers = makePointers(s => [Link("1", [undefined, s]), Link("2", [undefined, s])]);
    expect(sortPointers(pointers)[0].renderLink.type).toBe("2");
  });

  it('sorts a pointer in a later endset before a pointer in an earlier endset', () => {
    let pointers = makePointers(s => [Link("x", ["1", s], ["2", s])]);
    expect(sortPointers(pointers)[0].renderEnd.name).toBe("2");
  });

  it('sorts a pointer in a deeper endset before a pointer in a shallower endset', () => {
    let span = makeSpan();
    let childEdlPart = Part(EdlPointer("x"), Edl(undefined, [span], [LinkPointer("1")]));
    let parent = make(Edl(undefined, [childEdlPart.pointer], [LinkPointer("2")]), [Link("2", [undefined, [span]])], {
      parts: [childEdlPart, Part(LinkPointer("1"), Link("1", [undefined, [span]]))]
    });
    let pointers = parent.children[0].children.map(z => z.renderPointers()).flat();
    expect(sortPointers(pointers)[0].renderLink.type).toBe("1");
  });
});
