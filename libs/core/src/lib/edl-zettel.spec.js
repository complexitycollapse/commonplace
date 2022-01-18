import { describe, expect, it } from '@jest/globals';
import { Link } from './link';
import { Edl } from './edl';
import { EdlZettel } from './edl-zettel';
import { Endset } from './endset';
import { RenderEndset } from './render-endset';
import { RenderLink } from './render-link';
import { Span } from './span';
import { Box } from './box';
import { Part } from './part';
import { EdlPointer } from './pointer';

function make(edl, {endsets, key} = {}) {
  endsets = endsets ?? makeEndsets("a", "b", "c");
  key = key ?? "testKey";
  return EdlZettel(edl, endsets, key);
}

function emptyEdl() {
  return Edl(undefined, [], []);
}

function makeEdl(clips) {
  return Edl(undefined, clips, []);
}

function makeEndsets(...linkTypes) {
  return linkTypes.map(t => {
    let endset = Endset(undefined, []);
    return RenderEndset(endset, RenderLink(Link(t, endset)));
  });
}

describe('basic properties', () => {
  it('sets the key property', () => {
    expect(make(emptyEdl(), { key: "123" }).key).toBe("123");
  });

  it('sets the endsets property', () => {
    let endsets = makeEndsets("a", "b", "c");
    expect(make(emptyEdl(), { endsets }).endsets).toBe(endsets);
  });
});

describe('outstandingRequests', () => {
  it('returns nothing for an empty EDL', () => {
    expect(make(emptyEdl()).outstandingRequests()).toEqual([]);
  });

  it('returns a value for each clip', () => {
    let clips = [Span("x", 1, 10), Box("y", 0, 0, 100, 100)];

    let actualRequests = make(makeEdl(clips)).outstandingRequests();

    expect(actualRequests.map(x => x[0])).toEqual(clips);
  });

  it('stops returning a clip once it has been resolved', () => {
    let clips = [Span("x", 1, 10), Box("y", 0, 0, 100, 100)];
    let ez = make(makeEdl(clips));
    let firstRequest = ez.outstandingRequests()[0];

    firstRequest[1].call(undefined, Part(firstRequest[0], "0123456789"));

    expect(ez.outstandingRequests().map(x => x[0])).toEqual(clips.slice(1));
  });
});

describe('nested EDLs', () => {
  it('places a dummy EDL as the child when passed an EDL', () => {
    let ez = make(makeEdl([EdlPointer("name")]));
    let actualChild = ez.children[0];

    expect(actualChild).toBeTruthy();
    expect(actualChild.children).toEqual([]);
    expect(actualChild).toHaveProperty("outstandingRequests");
  });

  it('returns a request for the child EDL', () => {
    let childEdlPointer = EdlPointer("name");
    let ez = make(makeEdl([childEdlPointer]));

    expect(ez.outstandingRequests()[0][0]).toBe(childEdlPointer);
  });

  it('does not request the child EDL once it has been resolved', () => {
    let childEdlPointer = EdlPointer("name");
    let childEdl = emptyEdl();
    let ez = make(makeEdl([childEdlPointer]));
    let firstRequest = ez.outstandingRequests()[0];

    firstRequest[1].call(undefined, Part(firstRequest[0], childEdl));


    expect(ez.outstandingRequests()).toEqual([]);
  });

  it('replaces the dummy EDL with an EdlZettel for the resolved EDL', () => {
    let childEdlPointer = EdlPointer("name");
    let childEdl = emptyEdl();
    let ez = make(makeEdl([childEdlPointer]));
    let firstRequest = ez.outstandingRequests()[0];

    firstRequest[1].call(undefined, Part(firstRequest[0], childEdl));

    expect(ez.children[0].edl).toBe(childEdl);
  });

  it('requests all content of a resolved child EDL', () => {
    let clips = [Span("x", 1, 10), Box("y", 0, 0, 100, 100)];
    let childEdlPointer = EdlPointer("name");
    let childEdl = makeEdl(clips);
    let ez = make(makeEdl([childEdlPointer]));
    let firstRequest = ez.outstandingRequests()[0];
    firstRequest[1].call(undefined, Part(firstRequest[0], childEdl));

    let actualRequests = ez.outstandingRequests();

    expect(actualRequests.map(x => x[0])).toEqual(clips);
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
    let childEdl = emptyEdl();
    let ez = make(makeEdl([childEdlPointer]));
    let firstRequest = ez.outstandingRequests()[0];
    let expectedKey = ez.children[0].key;

    firstRequest[1].call(undefined, Part(firstRequest[0], childEdl));

    expect(ez.children[0].key).toEqual(expectedKey);
  });
});
