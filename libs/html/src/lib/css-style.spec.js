import { test, expect } from '@jest/globals';
import { CssStyle } from './css-style';

test('If there are no styles input then no css styles are returned', () => {
  expect(CssStyle([{}]).css()).toEqual({});
});

test('Styles with string values that are not understood are returned "as-is"', () => {
  let style = {randomName: "a value"};
  expect(CssStyle([style]).css()).toEqual(style);
});

test('Styles from multiple style objects are combined', () => {
  let styles = [{randomName: "a value"}, {randomName2: "another value"}];
  expect(CssStyle(styles).css()).toEqual({randomName: "a value", randomName2: "another value"});
});


test('Styles with false values that are not understood are not returned', () => {
  let styles = {randomName: "a value"};
  expect(CssStyle([styles]).css()).toEqual(styles);
});

test('A boolean true style that has a mapping will be mapped to the style in the mapping, with the original name as the value', () => {
  expect(CssStyle([{italic: true}]).css()).toEqual({fontStyle: "italic"});
});

test('A boolean false style that has a mapping is not returned', () => {
  expect(CssStyle([{randomName: false}]).css()).toEqual({});
});

test('If two different properties map to the same CSS property then the values are combined as a space-separated list', () => {
  expect(CssStyle([{italic: true, bold: true}]).css()).toEqual({fontStyle: "italic bold"});
});

test('If two different style sets properties map to the same CSS property then the values are combined as a space-separated list', () => {
  expect(CssStyle([{italic: true}, {bold: true}]).css()).toEqual({fontStyle: "italic bold"});
});
