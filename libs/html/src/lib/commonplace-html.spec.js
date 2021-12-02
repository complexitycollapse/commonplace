import { describe, it, expect } from '@jest/globals';
import { CommonplaceHtml } from './commonplace-html';
describe('CommonplaceHtml', () => {
  it('should work', () => {
    expect(CommonplaceHtml()).toEqual('html');
  });
});
