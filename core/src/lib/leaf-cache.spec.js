import { expect, test, describe } from '@jest/globals';
import { LinkPointer, EdlPointer, Span, InlinePointer } from './pointers';
import { LeafCache } from './leaf-cache';
import { Part } from './part';
import { Link, Edl } from './model';

function makePart() {
  return Part(Span("orig", 10, 20), "This is the content!");
}

describe('getPart/addPart', () => {
  test('getPart returns false if the name cannot be found in the cache', () => {
    expect(LeafCache().getPart("something")[0]).toBe(false);
  });

  test('getPart returns undefined if the name cannot be found in the cache', () => {
    expect(LeafCache().getPart("something")[1]).toBe(undefined);
  });

  test('getPart returns true if the part is in the cache', () => {
    let pc = LeafCache();
    let part = makePart();

    pc.addPart(part);

    expect(pc.getPart(part.pointer)[0]).toEqual(true);
  });

  test('getPart retrieves an added part', () => {
    let pc = LeafCache();
    let part = makePart();

    pc.addPart(part);

    expect(pc.getPart(part.pointer)[1]).toEqual(part);
  });

  test('getPart retrieves the part if it has 100% of the content in the cache', () => {
    let pc = LeafCache();
    let part = makePart();

    pc.addPart(part);

    expect(pc.getPart(part.pointer.clone({start: part.pointer.start + 1, length: part.pointer.length - 1}))[0]).toBe(true);
  });

  test('getPart returns false if any part of the requested content is missing', () => {
    let pc = LeafCache();
    let part = makePart();

    pc.addPart(part);

    expect(pc.getPart(part.pointer.clone({start: part.start + 1}))[0]).toBe(false);
  });

  test('getPart will not retrieve inherited object methods', () => {
    expect(LeafCache().getPart(Span("hasOwnProperty", 1, 1))[0]).toBe(false);
  });

  test('getPart still works even if we override hasOwnProperty', () => {
    let pc = LeafCache();
    let part = Part(Span("HasOwnPProperty", 1, 1), "a");

    pc.addPart(part);

    expect(pc.getPart(part.pointer)[0]).toBe(true);
  });

  test('getPart can retrieve a link when passed a link pointer', () => {
    let cache = LeafCache();
    let link = Link(InlinePointer("type"));
    let part = Part(LinkPointer("link name"), link);

    cache.addPart(part);

    expect(cache.getPart(LinkPointer("link name"))[1]).toBe(part);
  });

  test('getPart returns undefined if the link name doesnt match any link', () => {
    let cache = LeafCache();
    let link = Link(InlinePointer("type"));
    let part = Part(LinkPointer("link name"), link);

    cache.addPart(part);

    expect(cache.getPart(LinkPointer("other link name"))[0]).toBe(false);
  });

  test('getPart can retrieve an Edl when passed an Edl pointer', () => {
    let cache = LeafCache();
    let link = Edl(InlinePointer("document"), [], []);
    let part = Part(EdlPointer("doc name"), link);

    cache.addPart(part);

    expect(cache.getPart(EdlPointer("doc name"))[1]).toBe(part);
  });

  test('getPart always returns inline content from InlinePointer', () => {
    let cache = LeafCache();
    let pointer = InlinePointer("some text");

    let result = cache.getPart(pointer);

    expect(result[0]).toBe(true);
    expect(result[1].pointer).toBe(pointer);
    expect(result[1].content).toBe("some text");
  });
});
