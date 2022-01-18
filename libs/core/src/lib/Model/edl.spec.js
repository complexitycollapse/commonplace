import { expect, test, describe, it } from '@jest/globals';
import { hasClips } from "../Pointers/clip.test-helpers";
import { Edl, leafDataToEdl } from './edl';
import { Box } from '../Pointers/box';
import { spanTesting } from '../Pointers/span';
import { LinkPointer } from '../Pointers/pointer';

expect.extend({
  hasClips,
  toEqualSpan: spanTesting.toEqualSpan
});

let makeSpans = spanTesting.makeSpans;

test('type is set on the Edl', () => {
  let d = Edl("my chosen type");

  expect(d.type).toBe("my chosen type");
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
    expect(Edl("the type", spans, links).leafData()).toEqual({
      typ: "the type",
      cps: expect.arrayContaining(spans.map(s => s.leafData())),
      lks: expect.arrayContaining(links.map(l => l.leafData())),
    });
  });
});

test('leafDataToEdl is inverse of leafData', () => {
  let clips = [...makeSpans(10), Box("orig3", 11, 22, 33, 44)];
  let d = Edl("the type", clips, [LinkPointer("link1"), LinkPointer("link2"), LinkPointer("link3")]);
  expect(leafDataToEdl(d.leafData())).toEqual(d);
});
