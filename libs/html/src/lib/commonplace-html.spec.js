import { describe, it, expect } from '@jest/globals';
import { commonplaceHtml } from './commonplace-html';
describe('commonplaceHtml', () => {
  it('should work', () => {
    expect(commonplaceHtml()).toEqual('html');
  });
});
