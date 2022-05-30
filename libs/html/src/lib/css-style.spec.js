import { test, expect } from '@jest/globals';
import { CssStyle } from './css-style';

function make(object) {
  let attributes = new Map(Object.entries(object));
  return Object.entries(CssStyle(attributes).css());
}

test('If there are no styles input then no css styles are returned', () => {
  expect(make({})).toEqual([]);
});

test('Styles with string values that are not understood are returned "as-is"', () => {
  let styles = {randomName: "a value"};
  expect(make(styles)).toEqual(Object.entries(styles));
});

test('Styles with false values that are not understood are not returned', () => {
  let styles = {randomName: false};
  expect(make(styles)).toEqual([]);
});

test('A value with a mapping will be mapped to the CSS equivalent', () => {
  expect(make({italic: true})).toEqual([["fontStyle", "italic"]]);
});

test('If two different properties map to the same CSS property then the values are combined as a space-separated list', () => {
  expect(make({italic: true, bold: true})).toEqual([["fontStyle", "italic bold"]]);
});
