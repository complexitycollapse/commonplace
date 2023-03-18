import { describe, expect, it } from '@jest/globals';
import { CommonplaceCore } from './commonplace-core';
import { MockRepository } from './mock-repository';

function make() {
  return CommonplaceCore(MockRepository());
}

describe('commonplaceCore', () => {
  describe('addContent', () => {
    it('exists on the core object', async () => {
      expect(typeof await make().addContent).toBe('function');
    });

    it('returns a string name for the passed object', async () => {
      expect(typeof await make().addContent("Some text")).toBe('string');
    });

    it('inserts the content into the repository', async () => {
      let core = make();

      await core.addContent("Some text");

      let calls = core.repository.calls.forMethod("addContent");
      expect(calls.length).toBe(1);
    });

    it('inserts different content into the repository', async () => {
      let core = make();

      await core.addContent("Some text");
      await core.addContent("Some more text");

      let calls = core.repository.calls.forMethod("addContent");
      expect(calls.length).toBe(2);
    });

    it('does not insert the same content twice', async () => {
      let core = make();
      await core.addContent("Some text");
      core.repository.clearCalls();

      await core.addContent("Some text");

      let calls = core.repository.calls.forMethod("addContent");
      expect(calls.length).toBe(1);
    });
  });
});
