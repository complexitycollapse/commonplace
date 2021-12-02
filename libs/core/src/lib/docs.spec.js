import { expect, test, describe, it } from '@jest/globals';
import { hasEdits } from "./edits.test-helpers";
import { Link } from './links';
import { Doc, leafDataToDoc } from './docs';
import { Box, boxTesting } from './boxes';
import { Endset } from './endsets';
import { spanTesting } from './spans';

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

test('links is set on the doc', () => {
  let links = [Link("1"), Link("2"), Link("3")];

  let d = Doc([], links);

  expect(d.links.length).toBe(3);
  expect(d.links[0]).toBe(links[0]);
  expect(d.links[1]).toBe(links[1]);
  expect(d.links[2]).toBe(links[2]);
});

test('can pass no edits argument and get an empty spanSet', () => {
  let d = Doc();

  expect(d.edits).toBeTruthy();
  expect(d.edits).hasEdits();
});

test('can pass no links argument and get an empty links array', () => {
  let d = Doc();

  expect(d.links.length).toBe(0);
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
  it('has the edits and links properties', () => {
    let spans = makeSpans(5);
    let links = [Link("1"), Link("2"), Link("3")];
    expect(Doc(spans, links).leafData()).toEqual({
      edl: expect.arrayContaining(spans.map(s => s.leafData())),
      odl: expect.arrayContaining(links.map(l => l.leafData())),
    });
  });
});

test('leafDataToDoc is inverse of leafData', () => {
  let l1 = Link("type1", Endset("name1", "foo"), Endset("name2", [makeSpan(), Box("orig1", 1, 2, 3, 4)]));
  let l2 = Link("type2", Endset("name3", "blah"), Endset("name4", [makeSpan(), Box("orig2", 10, 20, 30, 40)]));
  let edits = [...makeSpans(10), Box("orig3", 11, 22, 33, 44)];
  let d = Doc(edits, [l1, l2]);
  expect(leafDataToDoc(d.leafData())).toEqual(d);
});
