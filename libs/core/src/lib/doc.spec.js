import { expect, test, describe, it } from '@jest/globals';
import { hasClips } from "./clip.test-helpers";
import { Doc, leafDataToDoc } from './doc';
import { Box, boxTesting } from './box';
import { spanTesting } from './span';

expect.extend({
  hasClips,
  toEqualSpan: spanTesting.toEqualSpan
});

let makeSpan = spanTesting.makeSpan, makeBox = boxTesting.makeBox;
let makeSpans = spanTesting.makeSpans;

test('clips is set on the doc', () => {
  let spans = makeSpans(3);

  let d = Doc(spans);

  expect(d.clips).hasClips(...spans);
});

test('overlay is set on the doc', () => {
  let overlay = ["link1", "link2"];

  let d = Doc([], overlay);

  expect(d.overlay).toEqual(overlay);
});

test('can pass no arguments and get an empty spanSet', () => {
  let d = Doc();

  expect(d.clips).toBeTruthy();
  expect(d.clips).hasClips();
});

test('can pass no arguments and get an empty overlay array', () => {
  let d = Doc();

  expect(d.overlay.length).toBe(0);
});

describe('leafData', () => {
  it('has the clips and overlay properties', () => {
    let spans = makeSpans(5);
    let overlay = ["link1", "link2", "link3"];
    expect(Doc(spans, overlay).leafData()).toEqual({
      edl: expect.arrayContaining(spans.map(s => s.leafData())),
      odl: expect.arrayContaining(overlay),
    });
  });
});

test('leafDataToDoc is inverse of leafData', () => {
  let clips = [...makeSpans(10), Box("orig3", 11, 22, 33, 44)];
  let d = Doc(clips, ["link1", "link2", "link3"]);
  expect(leafDataToDoc(d.leafData())).toEqual(d);
});
