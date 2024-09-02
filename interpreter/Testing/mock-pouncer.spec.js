import { describe, it, expect } from  'vitest';
import MockInterface from './mock-interface';
import MockPouncer from './mock-pouncer';
import { Link, LinkPointer } from '@commonplace/core';
import Part from './part';

describe("MockPouncer", () => {
  it('registers a callback on the interface', () => {
    const i = MockInterface();
    const pouncer = MockPouncer(i);

    expect(i.addedCallback).toBeTruthy();
    expect(i.cancelledCallback).toBeTruthy();
  });

  it('adds outstanding pointers on the interface to its outstanding collection', () => {
    const i = MockInterface();
    i.request(LinkPointer("foo"));

    const pouncer = MockPouncer(i);

    expect(pouncer.outstanding).toEqual([LinkPointer("foo")]);
  });

  it('attempts to resolve an outstanding pointer when resolve is called', () => {
    const i = MockInterface();
    i.request(LinkPointer("foo"));    
    const pouncer = MockPouncer(i);

    pouncer.resolve([Part(LinkPointer("foo"), Link())]);

    expect(i.outstanding).toEqual([]);
  });

  it('updates the outstanding property when pointers are resolved in the interface', () => {
    const i = MockInterface();
    i.request(LinkPointer("foo"));    
    const pouncer = MockPouncer(i);

    pouncer.resolve([Part(LinkPointer("foo"), Link())]);

    expect(pouncer.outstanding).toEqual([]);
  });

  it('attempts to resolve requested pointers from its cache', () => {
    const i = MockInterface();
    const pouncer = MockPouncer(i);
    pouncer.add(LinkPointer("foo"), Link());

    i.request([LinkPointer("foo")]);

    expect(i.outstanding).toEqual([]);
  });

  it('doesn\'t put requested pointers in outstanding if it can satify them from the cache', () => {
    const i = MockInterface();
    const pouncer = MockPouncer(i);
    pouncer.add(LinkPointer("foo"), Link());

    i.request([LinkPointer("foo")]);

    expect(pouncer.outstanding).toEqual([]);
  });

  it('removes a pointer from outstanding when the interface removes it', () => {
    const i = MockInterface();
    i.request(LinkPointer("foo"));
    const pouncer = MockPouncer(i);

    i.cancel([LinkPointer("foo")]);

    expect(pouncer.outstanding).toEqual([]);
  });
});
