import { test, expect, describe, it } from '@jest/globals';
import { CssStyle } from './css-style';

function makeCss(object) {
  let attributes = new Map(Object.entries(object));
  return Object.entries(CssStyle(attributes).css());
}

function makeFragmentTags(object) {
  let attributes = new Map(Object.entries(object));
  return CssStyle(attributes).fragmentTags();
}

describe("css", () => {
  test('If there are no properties input then no css styles are returned', () => {
    expect(makeCss({})).toEqual([]);
  });

  test('Properties that are not understood are ignored', () => {
    let styles = {randomName: "a value"};
    expect(makeCss(styles)).toEqual([]);
  });

  test('Properties with false values that are not understood are not returned', () => {
    let styles = {randomName: false};
    expect(makeCss(styles)).toEqual([]);
  });

  test('A property with a mapping will be mapped to the CSS equivalent', () => {
    expect(makeCss({italic: true})).toEqual([["fontStyle", "italic"]]);
  });

  test('If two different properties map to the same CSS property then the values are combined as a space-separated list', () => {
    expect(makeCss({italic: true, bold: true})).toEqual([["fontStyle", "italic bold"]]);
  });
});

describe('fragmentTags', () => {
  it('returns a fragment tag if one is defined', () => {
    expect(makeFragmentTags({paragraph: true})).toEqual(["p"]);
  });

  it('returns no fragment tags if none are defined', () => {
    expect(makeFragmentTags({italics: true})).toEqual([]);
  });
});
