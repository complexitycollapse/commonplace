import { describe, expect, it, jest} from '@jest/globals';
import { span, spanTesting } from './spans';
import { editIterator } from "./edit-iterators";

expect.extend({
  toEqualSpan: spanTesting.toEqualSpan
});

describe('editIterator', () => {
  it('has an initial position of undefined', () => {
    expect(editIterator(state => undefined).position()).toBeUndefined();
  });

  it('returns the span returned by the callback when called', () => {
    let s = span("o", 1, 2);
    expect(editIterator(state => [s, state])()).toEqualSpan(s);
  });

  it('has position of 0 after the first call', () => {
    let s = span("o", 1, 2);
    let iterator = editIterator(state => [s, state]);

    iterator();

    expect(iterator.position()).toBe(0);
  });

  it('increments the position by the length of the previous returned by the callback', () => {
    let s = span("o", 1, 2);
    let iterator = editIterator(state => [s, state]);

    iterator();
    iterator();

    expect(iterator.position()).toBe(2);
  });

  it('does not increment the position if the callback returns no span', () => {
    let s = span("o", 1, 2);
    let iterator = editIterator(state => state, [s]);

    iterator();
    iterator();

    iterator();
    expect(iterator.position()).toBe(2);

    iterator();
    expect(iterator.position()).toBe(2);
  });

  it('passes the initial state to the callback on the first invocation', () => {
    let s = span("o", 1, 2);
    let state = "initial state";
    let callback = jest.fn(x => [s, x]);
    let iterator = editIterator(callback, state);

    iterator();

    expect(callback.mock.calls[0][0]).toBe(state);
  });

  it('passes the state returned by the callback to the next invocation', () => {
    let s = span("o", 1, 2);
    let state = "subsequent state";
    let callback = jest.fn(x => [s, state]);
    let iterator = editIterator(callback, state);

    iterator();
    iterator();

    expect(callback.mock.calls[1][0]).toBe(state);
  });
});

describe('editIterator.forEach', () => {
  it('does not call the callback if there are no spans to iterate', () => {
    let callback = jest.fn((x, y) => x + y);

    editIterator(x => x, undefined).forEach(callback);

    expect(callback.mock.calls.length).toBe(0);
  });

  it('calls the callback with the spans in sequence if there are any', () => {
    let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
    let callback = jest.fn((x, y) => x + y);

    editIterator(x => x, [s1, [s2, [s3]]]).forEach(callback);

    expect(callback.mock.calls.length).toBe(3);
    expect(callback.mock.calls[0][0]).toEqualSpan(s1);
    expect(callback.mock.calls[1][0]).toEqualSpan(s2);
    expect(callback.mock.calls[2][0]).toEqualSpan(s3);
  });

  it('calls the callback with position argument equal to the sum of previous spans', () => {
    let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
    let callback = jest.fn((x, y) => x + y);

    editIterator(x => x, [s1, [s2, [s3]]]).forEach(callback);

    expect(callback.mock.calls[0][1]).toBe(0);
    expect(callback.mock.calls[1][1]).toBe(20);
    expect(callback.mock.calls[2][1]).toBe(50);
  });

  it('continues from where the iterator left off', () => {
    let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
    let callback = jest.fn((x, y) => x + y);
    let iterator = editIterator(x => x, [s1, [s2, [s3]]]);
    
    iterator();
    iterator.forEach(callback);

    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[0][0]).toEqualSpan(s2);
    expect(callback.mock.calls[0][1]).toBe(20);
    expect(callback.mock.calls[1][0]).toEqualSpan(s3);
    expect(callback.mock.calls[1][1]).toBe(50);
  });
});
