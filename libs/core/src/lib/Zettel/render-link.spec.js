import { test, expect, describe, it } from '@jest/globals';
import { RenderLink } from './render-link';
import { LinkPointer, Span } from '../pointers';
import { Link, Endset, directMetalinkType } from '../model';
import { Part } from '../part';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';
import { EdlBuilder, EdlZettelBuilder, EndsetBuilder, LinkBuilder, MetalinkBuilder, SpanBuilder } from '../builders';
import { attributeTesting } from './attributes';

expect.extend({
  hasAttribute: attributeTesting.hasAttribute,
  hasExactlyAttributes: attributeTesting.hasExactlyAttributes
 });

function make(link) {
  return RenderLink("foo", link, makeTestEdlAndEdlZettelFromLinks([link]));
}

test('The getHomeEdl method should return the EDL that the link resides in', () => {
  let link = Link();
  let edlZettel = makeTestEdlAndEdlZettelFromLinks([link]);
  expect(RenderLink("foo", link, edlZettel).getHomeEdl()).toBe(edlZettel);
});

test('if the type is unknown then the innerTag and fragmentTag properties are falsy', () => {
  let link = make(Link("some unknown type"));

  expect(link.innerTag).toBeFalsy();
  expect(link.fragmentTag).toBeFalsy();
});

test('if the type is unknown then style returns an empty object', () => {
  let link = make(Link("some unknown type"));

  expect(link.style()).toEqual({});
});

test('if the type has a fragmentTag then this is set on the RenderLink', () => {
  let link = make(Link("paragraph"));

  expect(link.fragmentTag).toBe("p");
});

test('if the type has a style then it is returned by style', () => {
  let link = make(Link("bold"));

  expect(link.style()).toEqual({bold: true});
});

test('attributes returns attribute values derived from modifiers', () => {
  let link = LinkBuilder().withName("target");
  let endowingLink = LinkBuilder().withName("endowing link").withEndset(EndsetBuilder().withPointer(link));
  let metalink = MetalinkBuilder(directMetalinkType).withName("metalink").pointingTo(endowingLink).endowing("attr1", "val1");
  let edl = EdlBuilder().withLinks(link, endowingLink, metalink);
  let edlZ = EdlZettelBuilder(edl).build();
  let renderLink = edlZ.renderLinks[0];
  
  expect(renderLink.attributes().values()).hasExactlyAttributes("attr1", "val1");
});

describe('outstandingRequests/getContentForPointer', () => {
  it('returns a request for any clip in an endset', () => {
    let clip = Span("x", 1, 10);
    let endset = Endset(undefined, [clip, LinkPointer("foo")]);
    let link = Link(undefined, endset);
    
    let renderLink = make(link);

    expect(renderLink.outstandingRequests().map(x => x[0])).toEqual([clip]);
  });

  it('returns undefined if the pointer has not yet been resolved', () => {
    let clip = Span("x", 1, 10);
    let endset = Endset(undefined, [clip, LinkPointer("foo")]);
    let link = Link(undefined, endset);
    
    let renderLink = make(link);

    expect(renderLink.getContentForPointer(clip, endset)).toBe(undefined);
  });

  it('stops requesting a pointer once it has been resolved', () => {
    let clip = Span("x", 1, 10);
    let part = Part(clip, "0123456789");
    let endset = Endset(undefined, [clip, LinkPointer("foo")]);
    let link = Link(undefined, endset);
    let renderLink = make(link);
    let request = renderLink.outstandingRequests()[0];

    request[1].call(undefined, part);

    expect(renderLink.outstandingRequests()).toEqual([]);
  });

  it('returns the content for the pointer once it has been resolved', () => {
    let clip = Span("x", 1, 10);
    let part = Part(clip, "0123456789");
    let endset = Endset(undefined, [clip, LinkPointer("foo")]);
    let link = Link(undefined, endset);
    let renderLink = make(link);
    let request = renderLink.outstandingRequests()[0];

    request[1].call(undefined, part);

    expect(renderLink.getContentForPointer(clip, endset)).toBe("0123456789");
  });
});
