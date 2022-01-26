import { test, expect, describe, it } from '@jest/globals';
import { RenderLink } from './render-link';
import { LinkPointer, EdlPointer, Span } from '../pointers';
import { Link, Endset } from '../model';
import { Part } from '../part';

function makeParagraphLink(...pointers) {
  return RenderLink(Link(
    "paragraph", 
    Endset(undefined, pointers.map(p => {
      if (typeof p === "string") {
        if (p.startsWith("link")) { return LinkPointer(p); }
        else if (p.startsWith("edl")) { return EdlPointer(p); }
      }
      return p;
    }))));
}

test('if the type is unknown then the innerTag and fragmentTag properties are falsy', () => {
  let link = RenderLink(Link("some unknown type"));

  expect(link.innerTag).toBeFalsy();
  expect(link.fragmentTag).toBeFalsy();
});

test('if the type is unknown then style returns an empty object', () => {
  let link = RenderLink(Link("some unknown type"));

  expect(link.style()).toEqual({});
});

test('if the type has a fragmentTag then this is set on the RenderLink', () => {
  let link = RenderLink(Link("paragraph"));

  expect(link.fragmentTag).toBe("p");
});

test('if the type has a style then it is returned by style', () => {
  let link = RenderLink(Link("bold"));

  expect(link.style()).toEqual({bold: true});
});

describe('outstandingRequests/getContentForPointer', () => {
  it('returns a request for any clip in an endset', () => {
    let clip = Span("x", 1, 10);
    let endset = Endset(undefined, [clip, LinkPointer("foo")]);
    let link = Link(undefined, endset);
    
    let renderLink = RenderLink(link, Link(undefined, Endset(undefined, [EdlPointer("bar")])));

    expect(renderLink.outstandingRequests().map(x => x[0])).toEqual([clip]);
  });

  it('returns undefined if the pointer has not yet been resolved', () => {
    let clip = Span("x", 1, 10);
    let endset = Endset(undefined, [clip, LinkPointer("foo")]);
    let link = Link(undefined, endset);
    
    let renderLink = RenderLink(link, Link(undefined, Endset(undefined, [EdlPointer("bar")])));

    expect(renderLink.getContentForPointer(clip, endset)).toBe(undefined);
  });

  it('stops requesting a pointer once it has been resolved', () => {
    let clip = Span("x", 1, 10);
    let part = Part(clip, "0123456789");
    let endset = Endset(undefined, [clip, LinkPointer("foo")]);
    let link = Link(undefined, endset);
    let renderLink = RenderLink(link, Link(undefined, Endset(undefined, [EdlPointer("bar")])));
    let request = renderLink.outstandingRequests()[0];

    request[1].call(undefined, part);

    expect(renderLink.outstandingRequests()).toEqual([]);
  });

  it('returns the content for the pointer once it has been resolved', () => {
    let clip = Span("x", 1, 10);
    let part = Part(clip, "0123456789");
    let endset = Endset(undefined, [clip, LinkPointer("foo")]);
    let link = Link(undefined, endset);
    let renderLink = RenderLink(link, Link(undefined, Endset(undefined, [EdlPointer("bar")])));
    let request = renderLink.outstandingRequests()[0];

    request[1].call(undefined, part);

    expect(renderLink.getContentForPointer(clip, endset)).toBe("0123456789");
  });
});
