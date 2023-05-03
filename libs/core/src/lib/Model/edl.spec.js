import { expect, test, describe, it } from '@jest/globals';
import { hasClips, Image, spanTesting, LinkPointer, InlinePointer } from "../pointers";
import { Edl, leafDataToEdl } from './edl';

expect.extend({
  hasClips,
  toEqualSpan: spanTesting.toEqualSpan
});

let makeSpans = spanTesting.makeSpans;

test('type is set on the Edl', () => {
  let d = Edl(InlinePointer("my chosen type"));

  expect(d.type).toEqual(InlinePointer("my chosen type"));
});

test('clips is set on the Edl', () => {
  let spans = makeSpans(3);

  let d = Edl(undefined, spans);

  expect(d.clips).hasClips(...spans);
});

test('links is set on the Edl', () => {
  let links = ["link1", "link2"];

  let d = Edl(undefined, [], links);

  expect(d.links).toEqual(links);
});

test('can pass no arguments and undefined type', () => {
  let d = Edl();

  expect(d.type).toBe(undefined);
});

test('can pass no arguments and get an empty spanSet', () => {
  let d = Edl();

  expect(d.clips).toBeTruthy();
  expect(d.clips).hasClips();
});

test('can pass no arguments and get an empty links array', () => {
  let d = Edl();

  expect(d.links.length).toBe(0);
});

describe('leafData', () => {
  it('has the type, clips and links properties', () => {
    let spans = makeSpans(5);
    let links = [LinkPointer("link1"), LinkPointer("link2"), LinkPointer("link3")];
    expect(Edl(InlinePointer("the type"), spans, links).leafData()).toEqual({
      typ: InlinePointer("the type").leafData(),
      cps: expect.arrayContaining(spans.map(s => s.leafData())),
      lks: expect.arrayContaining(links.map(l => l.leafData())),
    });
  });
});

test('leafDataToEdl is inverse of leafData', () => {
  let clips = [...makeSpans(10), Image("orig3", 11, 22, 33, 44)];
  let d = Edl(InlinePointer("the type"), clips, [LinkPointer("link1"), LinkPointer("link2"), LinkPointer("link3")]);
  expect(leafDataToEdl(d.leafData())).toEqual(d);
});
