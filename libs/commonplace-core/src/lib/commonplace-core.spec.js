import { describe, expect, it } from '@jest/globals';
import { commonplaceCore } from './commonplace-core';
describe('commonplaceCore', () => {
  it('is an object', () => {
    expect(commonplaceCore()).toEqual(expect.objectContaining({}));
  });

  describe('importContent', () => {
    it('exists on the core object', () => {
      expect(typeof commonplaceCore().importContent).toEqual('function');
    });

    it('returns a string name for the passed object', () => {
      expect(typeof commonplaceCore().importContent("Some text")).toEqual('string');
    });

    it('inserts the content into the repository', () => {
      let core = commonplaceCore();
      
      core.importContent("Some text");
      
      let calls = core.repository.calls.forMethod("addContent");
      expect(calls.length).toEqual(1);
    });

    it('inserts different content into the repository', () => {
      let core = commonplaceCore();
      
      core.importContent("Some text");
      core.importContent("Some more text");
      
      let calls = core.repository.calls.forMethod("addContent");
      expect(calls.length).toEqual(2);
    });

    it('does not insert the same content twice', () => {
      let core = commonplaceCore();
      core.importContent("Some text");
      core.repository.clearCalls();

      core.importContent("Some text");

      let calls = core.repository.calls.forMethod("addContent");
      expect(calls.length).toEqual(1);
    });
  });
});
