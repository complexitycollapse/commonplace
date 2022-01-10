import { expect, describe, it } from '@jest/globals';
import { Part } from './part';
import { Span } from './span';

function make(span = Span("orig", 10, 20), content = "This is the content!") {
  return Part(span, content);
}

describe('clone', () => {
  it('returns an identical object when no parameters are passed', () => {
    let part = make();
    expect(part.clone()).toEqual(part);
  });

  it('changes the content property if it is provided', () => {
    let part = make();
    expect(part.clone({content: "new content"}).content).toBe("new content");
  });

  it('sets content to undefined if that is the passed value', () => {
    let part = make();
    expect(part.clone({content: undefined}).content).toBe(undefined);
  });

  it('changes the pointer property if it is provided', () => {
    let part = make();

    let clone = part.clone({pointer: Span("new", 555, 999)});

    expect(clone.pointer.origin).toBe("new");
    expect(clone.pointer.start).toBe(555);
    expect(clone.pointer.length).toBe(999);
  });
});

describe('intersect', () => {
  it('returns undefined if the pointer does not overlap the Part', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersect(Span("x", 202, 20))).toBeFalsy();
  });

  it('returns an identical part if the pointers are the same', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersect(Span("x", 100, 10))).toEqual(part);
  });

  it('returns an identical par if the passed pointer is more expansive than the part', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersect(Span("x", 50, 200))).toEqual(part);
  });

  it('returns a part with the same content as the original if the pointer overlaps the part', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersect(Span("x", 105, 100)).content).toBe(part.content);
  });

  it('returns a part with an intersection of the pointers if the pointer overlaps the part', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersect(Span("x", 105, 100)).pointer).toEqual(Span("x", 105, 5));
  });
});
