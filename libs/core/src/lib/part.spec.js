import { expect, describe, it } from '@jest/globals';
import { Part } from './part';
import { Span } from './span';

function make() {
  return Part(Span("orig", 10, 20), "This is the content!");
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
