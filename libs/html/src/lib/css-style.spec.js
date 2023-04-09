import { test, expect, describe } from '@jest/globals';
import { CssStyle } from './css-style';

function makeCss(object) {
  let attributes = new Map(Object.entries(object));
  return Object.entries(CssStyle({ markup: attributes }).css());
}

describe('css', () => {
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
});
