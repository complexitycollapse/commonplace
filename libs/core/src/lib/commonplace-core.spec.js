import { describe, expect, it } from '@jest/globals';
import { CommonplaceCore } from './commonplace-core';
describe('commonplaceCore', () => {
  describe('importContent', () => {
    it('exists on the core object', () => {
      expect(typeof CommonplaceCore().importContent).toBe('function');
    });

    it('returns a string name for the passed object', () => {
      expect(typeof CommonplaceCore().importContent("Some text")).toBe('string');
    });

    it('inserts the content into the repository', () => {
      let core = CommonplaceCore();
      
      core.importContent("Some text");
      
      let calls = core.repository.calls.forMethod("addContent");
      expect(calls.length).toBe(1);
    });

    it('inserts different content into the repository', () => {
      let core = CommonplaceCore();
      
      core.importContent("Some text");
      core.importContent("Some more text");
      
      let calls = core.repository.calls.forMethod("addContent");
      expect(calls.length).toBe(2);
    });

    it('does not insert the same content twice', () => {
      let core = CommonplaceCore();
      core.importContent("Some text");
      core.repository.clearCalls();

      core.importContent("Some text");

      let calls = core.repository.calls.forMethod("addContent");
      expect(calls.length).toBe(1);
    });
  });
});
