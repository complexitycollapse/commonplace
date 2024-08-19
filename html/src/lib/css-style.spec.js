import { test, expect, describe } from 'vitest';
import { CssStyle } from './css-style';

function makeCss(object) {
  let attributes = new Map(Object.entries(object));
  return Object.entries(CssStyle({ markup: attributes }).css());
}

describe('css', () => {
  test('Properties that are not understood are ignored', () => {
    let styles = {randomName: "a value"};
    expect(makeCss(styles)).toEqual(makeCss({}));
  });

  test('Properties with false values that are not understood are not returned', () => {
    let styles = {randomName: false};
    expect(makeCss(styles)).toEqual(makeCss({}));
  });

  test('A property with a mapping will be mapped to the CSS equivalent', () => {
    expect(makeCss({italic: true})).toEqual([["fontStyle", "italic"]].concat(makeCss({})));
  });
});
