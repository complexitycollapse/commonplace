import { expect, test, describe } from '@jest/globals';
import { PartCache } from './part-cache';
import { Part } from './part';
import { Span } from './span';

function makePart() {
  return Part(Span("orig", 10, 20), "This is the content!");
}

describe('getPart/addPart', () => {
  test('getPart returns undefined if the name cannot be found in the cache', () => {
    expect(PartCache().getPart("something")).toBe(undefined);
  });

  test('getPart retrieves an added part', () => {
    let pc = PartCache();
    let part = makePart();
    
    pc.addPart(part);

    expect(pc.getPart(part)).toEqual(part);
  });

  test('getPart retrieves the part if it has 100% of the content in the cache', () => {
    let pc = PartCache();
    let part = makePart();
    
    pc.addPart(part);

    expect(pc.getPart(part.clone({start: part.start + 1, length: part.length - 1}))).toEqual(part);
  });

  test('getPart returns nothing if any part of the requested content is missing', () => {
    let pc = PartCache();
    let part = makePart();
    
    pc.addPart(part);

    expect(pc.getPart(part.clone({start: part.start + 1}))).toBe(undefined);
  });

  test('getPart will not retrieve inherited object methods', () => {
    expect(PartCache().getPart(Span("hasOwnProperty", 1, 1))).toBe(undefined);
  });

  test('getPart still works even if we override hasOwnProperty', () => {
    let pc = PartCache();
    let part = Part(Span("HasOwnPProperty", 1, 1));
    
    pc.addPart(part);

    expect(pc.getPart(part)).toEqual(part);
  });
});

describe('getObject/addObject', () => {
  test('get object returns an added object', () => {
    let cache = PartCache();
    let object = {some: "object"};

    cache.addObject("object name", object);

    expect(cache.getObject("object name")).toBe(object);
  });

  test('getObject returns undefined for a missing object', () => {
    let cache = PartCache();

    expect(cache.getObject("object name")).toBe(undefined);
  });
});
