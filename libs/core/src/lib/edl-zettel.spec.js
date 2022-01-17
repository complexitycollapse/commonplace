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
