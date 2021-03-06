import { describe, expect, it, jest} from '@jest/globals';
import { Span, spanTesting } from './span';
import { ClipIterator } from "./clip-iterator";

expect.extend({
  toEqualSpan: spanTesting.toEqualSpan
});

describe('clipIterator', () => {
  it('has an initial position of undefined', () => {
    expect(ClipIterator(state => undefined).position()).toBeUndefined();
  });

  it('returns the span returned by the callback when called', () => {
    let s = Span("o", 1, 2);
    expect(ClipIterator(state => [s, state])()).toEqualSpan(s);
  });

  it('has position of 0 after the first call', () => {
    let s = Span("o", 1, 2);
    let iterator = ClipIterator(state => [s, state]);

    iterator();

    expect(iterator.position()).toBe(0);
  });

  it('increments the position by the length of the previous returned by the callback', () => {
    let s = Span("o", 1, 2);
    let iterator = ClipIterator(state => [s, state]);

    iterator();
    iterator();

    expect(iterator.position()).toBe(2);
  });

  it('does not increment the position if the callback returns no span', () => {
    let s = Span("o", 1, 2);
    let iterator = ClipIterator(state => state, [s]);

    iterator();
    iterator();

    iterator();
    expect(iterator.position()).toBe(2);

    iterator();
    expect(iterator.position()).toBe(2);
  });

  it('passes the initial state to the callback on the first invocation', () => {
    let s = Span("o", 1, 2);
    let state = "initial state";
    let callback = jest.fn(x => [s, x]);
    let iterator = ClipIterator(callback, state);

    iterator();

    expect(callback.mock.calls[0][0]).toBe(state);
  });

  it('passes the state returned by the callback to the next invocation', () => {
    let s = Span("o", 1, 2);
    let state = "subsequent state";
    let callback = jest.fn(x => [s, state]);
    let iterator = ClipIterator(callback, state);

    iterator();
    iterator();

    expect(callback.mock.calls[1][0]).toBe(state);
  });
});

describe('clipIterator.forEach', () => {
  it('does not call the callback if there are no spans to iterate', () => {
    let callback = jest.fn((x, y) => x + y);

    ClipIterator(x => x, undefined).forEach(callback);

    expect(callback.mock.calls.length).toBe(0);
  });

  it('calls the callback with the spans in sequence if there are any', () => {
    let s1 = Span("a", 10, 20), s2 = Span("a", 20, 30), s3 = Span("a", 30, 40);
    let callback = jest.fn((x, y) => x + y);

    ClipIterator(x => x, [s1, [s2, [s3]]]).forEach(callback);

    expect(callback.mock.calls.length).toBe(3);
    expect(callback.mock.calls[0][0]).toEqualSpan(s1);
    expect(callback.mock.calls[1][0]).toEqualSpan(s2);
    expect(callback.mock.calls[2][0]).toEqualSpan(s3);
  });

  it('calls the callback with position argument equal to the sum of previous spans', () => {
    let s1 = Span("a", 10, 20), s2 = Span("a", 20, 30), s3 = Span("a", 30, 40);
    let callback = jest.fn((x, y) => x + y);

    ClipIterator(x => x, [s1, [s2, [s3]]]).forEach(callback);

    expect(callback.mock.calls[0][1]).toBe(0);
    expect(callback.mock.calls[1][1]).toBe(20);
    expect(callback.mock.calls[2][1]).toBe(50);
  });

  it('continues from where the iterator left off', () => {
    let s1 = Span("a", 10, 20), s2 = Span("a", 20, 30), s3 = Span("a", 30, 40);
    let callback = jest.fn((x, y) => x + y);
    let iterator = ClipIterator(x => x, [s1, [s2, [s3]]]);
    
    iterator();
    iterator.forEach(callback);

    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[0][0]).toEqualSpan(s2);
    expect(callback.mock.calls[0][1]).toBe(20);
    expect(callback.mock.calls[1][0]).toEqualSpan(s3);
    expect(callback.mock.calls[1][1]).toBe(50);
  });
});
