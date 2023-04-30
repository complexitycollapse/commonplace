import { expect, it, describe } from '@jest/globals';
import { testing, Part, defaultsPointer } from '@commonplace/core';
import { DefaultsDocModel, defaultsEdl, defaultsLinksParts } from './defaults';

describe('DefaultsDocModel', () => {
  it('returns a valid DocModel', () => {
    let repo = testing.createTestCache([Part(defaultsPointer, defaultsEdl)].concat(defaultsLinksParts), true);

    let defaults = DefaultsDocModel(repo);

    expect(Object.values(defaults.links)).toHaveLength(defaultsEdl.links.length);
  });
});
