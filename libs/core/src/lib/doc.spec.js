import { expect, test, describe, it } from '@jest/globals';
import { hasEdits } from "./edit.test-helpers";
import { Doc, leafDataToDoc } from './doc';
import { Box, boxTesting } from './box';
import { spanTesting } from './span';

expect.extend({
  hasEdits,
  toEqualSpan: spanTesting.toEqualSpan
});

let makeSpan = spanTesting.makeSpan, makeBox = boxTesting.makeBox;
let makeSpans = spanTesting.makeSpans;

test('edits is set on the doc', () => {
  let spans = makeSpans(3);

  let d = Doc(spans);

  expect(d.edits).hasEdits(...spans);
});

test('overlay is set on the doc', () => {
  let overlay = ["link1", "link2"];

  let d = Doc([], overlay);

  expect(d.overlay).toEqual(overlay);
});

test('can pass no edits argument and get an empty spanSet', () => {
  let d = Doc();

  expect(d.edits).toBeTruthy();
  expect(d.edits).hasEdits();
});

test('can pass no overlay argument and get an empty overlay array', () => {
  let d = Doc();

  expect(d.overlay.length).toBe(0);
});


describe('concLength', () => {
  it('returns 0 for empty set', () => {
    expect(Doc().concLength()).toBe(0);
  });

  it('returns the length of a span when it has one span', () => {
    let d = Doc([makeSpan({length: 100})]);
    expect(d.concLength()).toBe(100);
  });

  it('returns the length of a box when it has one box', () => {
    let d = Doc([Box("a", 10, 20, 30, 40)]);
    expect(d.concLength()).toBe(1);
  });

  it('returns the sum of the lengths of edits it contains', () => {
    let d = Doc([makeSpan({length: 100}), makeBox(), makeSpan({length: 3})]);
    expect(d.concLength()).toBe(104);
  });
});

describe('leafData', () => {
  it('has the edits and overlay properties', () => {
    let spans = makeSpans(5);
    let overlay = ["link1", "link2", "link3"];
    expect(Doc(spans, overlay).leafData()).toEqual({
      edl: expect.arrayContaining(spans.map(s => s.leafData())),
      odl: expect.arrayContaining(overlay),
    });
  });
});

test('leafDataToDoc is inverse of leafData', () => {
  let edits = [...makeSpans(10), Box("orig3", 11, 22, 33, 44)];
  let d = Doc(edits, ["link1", "link2", "link3"]);
  expect(leafDataToDoc(d.leafData())).toEqual(d);
});
