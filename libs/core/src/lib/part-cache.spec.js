import { expect, test} from '@jest/globals';
import { PartCache } from './part-cache';


test('getPart returns undefined if the name cannot be found in the cache', () => {
  expect(PartCache().getPart("something")).toBe(undefined);
});

test('getPart retrieves an added part', () => {
  var pc = PartCache();
  
  pc.addPart("foo", "some content");

  expect(pc.getPart("foo")).toBe("some content");
});

test('getPart will not retrieve inherited object methods', () => {
  expect(PartCache().getPart("hasOwnProperty")).toBe(undefined);
});

test('getPart still works even if we override hasOwnProperty', () => {
  var pc = PartCache();
  
  pc.addPart("hasOwnProperty", "some content");

  expect(pc.getPart("hasOwnProperty")).toBe("some content");
});
