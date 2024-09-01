import { describe, it, expect } from  'vitest';
import MockInterface from './mock-interface';
import MockPouncer from './mock-pouncer';
import { Link, LinkPointer } from '@commonplace/core';
import Part from './part';

describe("MockPouncer", () => {
  it('registers a callback on the interface', () => {
    const i = MockInterface();
    const pouncer = MockPouncer(i);

    expect(i.callback).toBeTruthy();
  });

  it('adds unresolved pointers on the interface to its unresolved collection', () => {
    const i = MockInterface();
    i.request(LinkPointer("foo"));

    const pouncer = MockPouncer(i);

    expect(pouncer.unresolved).toEqual([LinkPointer("foo")]);
  });

  it('attempts to resolve an unresolved pointer when resolve is called', () => {
    const i = MockInterface();
    i.request(LinkPointer("foo"));    
    const pouncer = MockPouncer(i);

    pouncer.resolve([Part(LinkPointer("foo"), Link())]);

    expect(i.unresolved).toEqual([]);
  });

  it('updates the unresolved property when pointers are resolved in the interface', () => {
    const i = MockInterface();
    i.request(LinkPointer("foo"));    
    const pouncer = MockPouncer(i);

    pouncer.resolve([Part(LinkPointer("foo"), Link())]);

    expect(pouncer.unresolved).toEqual([]);
  });

  it('attempts to resolve requested pointers from its cache', () => {
    const i = MockInterface();
    const pouncer = MockPouncer(i);
    pouncer.add(LinkPointer("foo"), Link());

    i.request([LinkPointer("foo")]);

    expect(i.unresolved).toEqual([]);
  });

  it('doesn\'t put requested pointers in unresolved if it can satify them from the cache', () => {
    const i = MockInterface();
    const pouncer = MockPouncer(i);
    pouncer.add(LinkPointer("foo"), Link());

    i.request([LinkPointer("foo")]);

    expect(pouncer.unresolved).toEqual([]);
  });
});
