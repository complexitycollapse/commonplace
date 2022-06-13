import { test, expect, describe, it } from '@jest/globals';
import { RenderLink } from './render-link';
import { LinkPointer, Span } from '../pointers';
import { Link, Endset, contentMetalinkType, directMetalinkType } from '../model';
import { Part } from '../part';
import { makeTestEdlAndEdlZettelFromLinks } from './edl-zettel';
import { EdlBuilder, EdlZettelBuilder, EndsetBuilder, LinkBuilder, MetalinkBuilder } from '../builders';
import { attributesTesting } from './attributes';

expect.extend({
  hasAttribute: attributesTesting.hasAttribute,
  hasExactlyAttributes: attributesTesting.hasExactlyAttributes
 });

function makeLinkAndMetalink(target, metalinkType, attributeName, attributeValue) {
  let endowingLink = LinkBuilder().withName("endowing link").withEndset(EndsetBuilder().withPointer(target));
  let metalink = MetalinkBuilder(metalinkType)
    .withName("metalink")
    .pointingTo(endowingLink)
    .endowing(attributeName, attributeValue);
  return [endowingLink, metalink];
}

function make(link) {
  return RenderLink("foo", link, makeTestEdlAndEdlZettelFromLinks([link]));
}

test('The getHomeEdl method should return the EDL that the link resides in', () => {
  let link = Link();
  let edlZettel = makeTestEdlAndEdlZettelFromLinks([link]);
  expect(RenderLink("foo", link, edlZettel).getHomeEdl()).toBe(edlZettel);
});

test('attributes returns attribute values derived from modifiers', () => {
  let link = LinkBuilder().withName("target");
  let edl = EdlBuilder().withLinks(link, ...makeLinkAndMetalink(link, directMetalinkType, "attr1", "val1"));
  let edlZ = EdlZettelBuilder(edl).build();
  let renderLink = edlZ.renderLinks[0];
  
  expect(renderLink.attributes().values()).hasExactlyAttributes("attr1", "val1");
});

test('attributes returns default direct values if there are no modifiers', () => {
  let link = LinkBuilder().withName("target");
  let edl = EdlBuilder().withLink(link);
  let edlZ = EdlZettelBuilder(edl).withDefaults(...makeLinkAndMetalink(link, directMetalinkType, "attr1", "default value")).build();
  let renderLink = edlZ.renderLinks[0];
  
  expect(renderLink.attributes().values()).hasExactlyAttributes("attr1", "default value");
});

test('attributes returns default content values if there are no modifiers', () => {
  let link = LinkBuilder().withName("target");
  let edl = EdlBuilder().withLink(link);
  let edlZ = EdlZettelBuilder(edl).withDefaults(...makeLinkAndMetalink(link, contentMetalinkType, "attr1", "default value")).build();
  let renderLink = edlZ.renderLinks[0];
  
  expect(renderLink.attributes().values()).hasExactlyAttributes("attr1", "default value");
});

test('attributes returns values from links in preference to defaults', () => {
  let link = LinkBuilder().withName("target");
  let edl = EdlBuilder().withLinks(link, ...makeLinkAndMetalink(link, contentMetalinkType, "attr1", "override value"));
  let edlZ = EdlZettelBuilder(edl).withDefaults(...makeLinkAndMetalink(link, directMetalinkType, "attr1", "default value")).build();
  let renderLink = edlZ.renderLinks[0];
  
  expect(renderLink.attributes().values()).hasExactlyAttributes("attr1", "override value");
});

describe('outstandingRequests', () => {
  it('returns a request for any clip in an endset', () => {
    let clip = Span("x", 1, 10);
    let endset = [undefined, [clip, LinkPointer("foo")]];
    let link = Link(undefined, endset);
    
    let renderLink = make(link);

    expect(renderLink.outstandingRequests().map(x => x[0])).toEqual([clip]);
  });

  it('stops requesting a pointer once it has been resolved', () => {
    let clip = Span("x", 1, 10);
    let part = Part(clip, "0123456789");
    let endset = [undefined, [clip, LinkPointer("foo")]];
    let link = Link(undefined, endset);
    let renderLink = make(link);
    let request = renderLink.outstandingRequests()[0];

    request[1].call(undefined, part);

    expect(renderLink.outstandingRequests()).toEqual([]);
  });
});

describe('getRenderEndset', () => {
  it('returns undefined if the endset cannot be found amongst the links endsets', () => {
    let endset = Endset(undefined, [], 0);
    let link = Link(undefined);
    let renderLink = make(link);

    expect(renderLink.getRenderEndset(endset)).toBe(undefined);
  });

  it('returns the correct endset if it exists on the link', () => {
    let endset = Endset(undefined, [], 0);
    let link = Link(undefined, [undefined, []]);
    let renderLink = make(link);

    expect(renderLink.getRenderEndset(endset).endset).toEqual(endset);
  });

  it('returns the correct endset and not another endset', () => {
    let endset = Endset(undefined, [], 1);
    let link = Link(undefined, ["name A", []], [undefined, []], ["name B", []]);
    let renderLink = make(link);

    expect(renderLink.getRenderEndset(endset).endset).toEqual(endset);
  });
});

describe('createRenderPointer', () => {
  it('returns a RenderPointer for the given pointer', () => {
    let pointer = Span("z", 1, 10);
    let link = Link(undefined, [undefined, [pointer]]);
    let renderLink = make(link);

    expect(renderLink.createRenderPointer(pointer, link.endsets[0]).pointer.denotesSame(pointer)).toBeTruthy();
  });

  it('returns a RenderPointer for the given endset', () => {
    let pointer = Span("z", 1, 10);
    let link = Link(undefined, [undefined, [pointer]]);
    let renderLink = make(link);
    let expectedRenderEndset = renderLink.renderEndsets[0];

    expect(renderLink.createRenderPointer(pointer, link.endsets[0]).renderEndset).toBe(expectedRenderEndset);
  });

  it('throws an exception if the endset is not in the link', () => {
    let pointer = Span("z", 1, 10);
    let link = Link(undefined, [undefined, [pointer]]);
    let badEndset = Endset("bad", [pointer], 1);
    let renderLink = make(link);

    expect(() => renderLink.createRenderPointer(pointer, badEndset)).toThrow();
  });
});
