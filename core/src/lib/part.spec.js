import { expect, describe, it } from 'vitest';
import { Part } from './part';
import { Span } from './pointers';

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

