import { expect, test, describe, it } from '@jest/globals';
import { hasEdits, makeSpans, toEqualSpan, makeSpan, makeBox } from "./edits.test-helpers";
import { link } from './links';
import { doc } from './docs';
import { box } from './boxes';

expect.extend({
  hasEdits,
  toEqualSpan
});

test('edits is set on the doc', () => {
  let spans = makeSpans(3);

  let d = doc(spans);

  expect(d.edits).hasEdits(...spans);
});

test('links is set on the doc', () => {
  let links = [link("1"), link("2"), link("3")];

  let d = doc([], links);

  expect(d.links.length).toBe(3);
  expect(d.links[0]).toBe(links[0]);
  expect(d.links[1]).toBe(links[1]);
  expect(d.links[2]).toBe(links[2]);
});

test('can pass no edits argument and get an empty spanSet', () => {
  let d = doc();

  expect(d.edits).toBeTruthy();
  expect(d.edits).hasEdits();
});

test('can pass no links argument and get an empty links array', () => {
  let d = doc();

  expect(d.links.length).toBe(0);
});


describe('concLength', () => {
  it('returns 0 for empty set', () => {
    expect(doc().concLength()).toBe(0);
  });

  it('returns the length of a span when it has one span', () => {
    let d = doc([makeSpan({length: 100})]);
    expect(d.concLength()).toBe(100);
  });

  it('returns the length of a box when it has one box', () => {
    let d = doc([box("a", 10, 20, 30, 40)]);
    expect(d.concLength()).toBe(1);
  });

  it('returns the sum of the lengths of edits it contains', () => {
    let d = doc([makeSpan({length: 100}), makeBox(), makeSpan({length: 3})]);
    expect(d.concLength()).toBe(104);
  });
});

describe('leafData', () => {
  it('has the edits and links properties', () => {
    let spans = makeSpans(5);
    let links = [link("1"), link("2"), link("3")];
    expect(doc(spans, links).leafData()).toEqual({
      edits: expect.arrayContaining(spans.map(s => s.leafData())),
      links: expect.arrayContaining(links.map(l => l.leafData())),
    });
  });
});
