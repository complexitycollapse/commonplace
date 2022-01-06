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

  it('changes the properties inherited from clip, if provided', () => {
    let part = make();

    let clone = part.clone({origin:"new", start: 555, length: 999});

    expect(clone.origin).toBe("new");
    expect(clone.start).toBe(555);
    expect(clone.length).toBe(999);
  });
});

describe('overlaps', () => {
  it('returns true if the given clip overlaps the parts clip', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.overlaps(Span("x", 102, 20))).toBeTruthy();
  });

  it('returns false if the given clip overlaps the parts clip', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.overlaps(Span("x", 202, 20))).toBeFalsy();
  });
});

describe('intersectingContent', () => {
  it('returns undefined if the clip does not overlap the Part', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersectingContent(Span("x", 202, 20))).toBeFalsy();
  });

  it('returns the whole content if the spans are the same', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersectingContent(Span("x", 100, 10))).toBe("abcdefghij");
  });

  it('returns the whole content if the passed span is more expansive', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersectingContent(Span("x", 50, 200))).toBe("abcdefghij");
  });

  it('returns the portion of the content selected by the span', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersectingContent(Span("x", 101, 8))).toBe("bcdefghi");
  });

  it('returns the overlapping portion of the content when the passed clip starts earlier', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersectingContent(Span("x", 90, 19))).toBe("abcdefghi");
  });

  it('returns the overlapping portion of the content when the passed clip ends later', () => {
    let part = make(Span("x", 100, 10), "abcdefghij");

    expect(part.intersectingContent(Span("x", 101, 20))).toBe("bcdefghij");
  });
});
