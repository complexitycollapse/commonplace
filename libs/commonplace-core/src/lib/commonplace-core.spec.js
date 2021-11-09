import { commonplaceCore } from './commonplace-core';
describe('commonplaceCore', () => {
  it('is an object', () => {
    expect(commonplaceCore()).toEqual(expect.objectContaining({}));
  });
});
