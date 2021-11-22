import { expect, test } from '@jest/globals';
import { endset } from './endsets';

test('the passed name becomes the name property', () => {
  expect(endset("a name").name).toBe("a name");
});

test('the passed string becomes the set property', () => {
  expect(endset("name", "string value").set).toBe("string value");
});
