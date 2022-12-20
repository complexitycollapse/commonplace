import { describe, expect, it } from '@jest/globals';
import { Link, Edl } from '@commonplace/core';
import { defaultsPointer, makeTestEdlZettel } from './edl-zettel';
import { Span, Box, EdlPointer, LinkPointer } from '@commonplace/core';
import { Part } from '@commonplace/core';

let make = makeTestEdlZettel;

function makeEdl(clips = [], links = []) {
  return Edl(undefined, clips, links);
}

function resolve(request, value) {
  request[1].call(undefined, Part(request[0], value));
}

describe('basic properties', () => {
  it('sets the key property', () => {
    expect(make(makeEdl(), { key: "123" }).key).toBe("123");
  });

  it('sets the parent property', () => {
    let parent = make(makeEdl());
    expect(make(makeEdl(), { parent }).parent).toBe(parent);
  });

  it('sets the hashableName property to the hashable name the EDL pointer', () => {
    let edlPointer = EdlPointer("some name", 10);
    expect(make(makeEdl(), { edlPointer }).hashableName).toBe(edlPointer.hashableName);
  });
});

describe('key', () => {
  it('sets the key of the EDL dummy to be a sub-key of the parent', () => {
    let ez = make(makeEdl([EdlPointer("name")]), { key: "parent" });
    let actualChild = ez.children[0];

    expect(actualChild.key).toBe("parent.0");
  });

  it('sets unique keys on each clip', () => {
    let ez = make(makeEdl(
      [EdlPointer("name"), EdlPointer("name2"), Span("x", 10, 100), Box("y", 1, 1, 10, 11)]), 
      { key: "parent" });

    expect(ez.children[0].key).toBe("parent.0");
    expect(ez.children[1].key).toBe("parent.1");
    expect(ez.children[2].key).toBe("parent.2.0");
    expect(ez.children[3].key).toBe("parent.3.0");
  });

  it('gives the same key to the resolved EdlZettel as it did to the dummy', () => {
    let childEdlPointer = EdlPointer("name");
    let childEdl = makeEdl();
    let ez = make(makeEdl([childEdlPointer]));
    let firstRequest = ez.outstandingRequests()[0];
    let expectedKey = ez.children[0].key;

    firstRequest[1].call(undefined, Part(firstRequest[0], childEdl));

    expect(ez.children[0].key).toEqual(expectedKey);
  });
});

describe('links to EDL', () => {
  it('will create a RenderPointer for a link in the EDL that points to the EDL', () => {
    let edlPointer = EdlPointer("name");
    let ez = make(makeEdl([], [LinkPointer("foo")]), { edlPointer: edlPointer });

    resolve(ez.outstandingRequests()[0], Link(undefined, [undefined, [edlPointer]]));

    expect(ez.renderPointers().map(p => p.pointer)).toEqual([edlPointer]);
  });

  it('will not create a render pointer if the link pointer points to a different EDL', () => {
    let edlPointer = EdlPointer("name");
    let ez = make(makeEdl([], [LinkPointer("foo")]), { edlPointer: edlPointer });

    resolve(ez.outstandingRequests()[0], Link(undefined, [undefined, [EdlPointer("something else")]]));

    expect(ez.renderPointers()).toEqual([]);
  });

  it('will create a render pointer for links in the parent that point to the child EDL', () => {
    let childPointer = EdlPointer("child");
    let parent = make(makeEdl([childPointer], [LinkPointer("foo")]));
    resolve(parent.outstandingRequests()[0], Link(undefined, [undefined, [childPointer]]));

    let child = make(makeEdl([], []), { parent: parent, edlPointer: childPointer });

    expect(child.renderPointers().map(p => p.pointer)).toEqual([childPointer]);
  });
});

describe('depth', () => {
  it('is 0 for an Edl with no parent', () => {
    expect(make(makeEdl()).depth).toBe(0);
  });

  it('is 1 for an Edl with a parent that has no parent', () => {
    expect(make(makeEdl(), { parent: make(makeEdl()) }).depth).toBe(1);
  });

  it('is 2 for an Edl with a parent that has a parent that has no parent', () => {
    expect(make(makeEdl(), { parent: make(makeEdl(), { parent: make(makeEdl()) }) }).depth).toBe(2);
  });

  it('is -1 for the default EDL', () => {
    expect(make(makeEdl(), { edlPointer: defaultsPointer }).depth).toBe(-1);
  });
});
