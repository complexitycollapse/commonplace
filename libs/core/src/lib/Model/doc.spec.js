import { expect, test } from '@jest/globals';
import { hasClips, spanTesting } from "../pointers";
import { Doc } from './doc';
import { documentType } from '../well-known-objects';

expect.extend({
  hasClips,
  toEqualSpan: spanTesting.toEqualSpan
});

let makeSpans = spanTesting.makeSpans;

test('type is set to the document type', () => {
  let spans = makeSpans(3);

  let d = Doc(spans);

  expect(d.type).toEqual(documentType);
});

test('clips is set on the doc', () => {
  let spans = makeSpans(3);

  let d = Doc(spans);

  expect(d.clips).hasClips(...spans);
});

test('links is set on the doc', () => {
  let links = ["link1", "link2"];

  let d = Doc([], links);

  expect(d.links).toEqual(links);
});

test('can pass no arguments and get an EDL of document type', () => {
  let d = Doc();

  expect(d.type).toEqual(documentType);
});

test('can pass no arguments and get an empty spanSet', () => {
  let d = Doc();

  expect(d.clips).toBeTruthy();
  expect(d.clips).hasClips();
});

test('can pass no arguments and get an empty links array', () => {
  let d = Doc();

  expect(d.links.length).toBe(0);
});
