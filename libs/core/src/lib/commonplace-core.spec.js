import { describe, expect, it } from '@jest/globals';
import { CommonplaceCore } from './commonplace-core';
describe('commonplaceCore', () => {
  describe('importContent', () => {
    it('exists on the core object', () => {
      expect(typeof CommonplaceCore().importContent).toBe('function');
    });

    it('returns a string name for the passed object', () => {
      CommonplaceCore().importContent(name => {
        expect(typeof name).toBe('string');
      },"Some text");
    });

    it('inserts the content into the repository', () => {
      let core = CommonplaceCore();
      
      core.importContent(() => {
        let calls = core.repository.calls.forMethod("addContent");
        expect(calls.length).toBe(1);
      }, "Some text");
    });

    it('inserts different content into the repository', () => {
      let core = CommonplaceCore();
      
      core.importContent(() => {
        core.importContent(() => {
          let calls = core.repository.calls.forMethod("addContent");
          expect(calls.length).toBe(2);
        }, "Some more text");
      }, "Some text");
    });

    it('does not insert the same content twice', () => {
      let core = CommonplaceCore();

      core.importContent(() => {
        core.repository.clearCalls();
        core.importContent(() => {
          let calls = core.repository.calls.forMethod("addContent");
          expect(calls.length).toBe(1);
        }, "Some text");
      }, "Some text");
    });
  });
});
