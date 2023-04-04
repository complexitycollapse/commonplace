import { expect, it, describe } from '@jest/globals';
import { testing, Part } from '@commonplace/core';
import { DefaultsDocModel, defaultsPointer, defaultsEdl, defaultsLinksParts } from './defaults';

describe('DefaultsDocModel', () => {
  it('returns a valid DocModel', () => {
    let repo = testing.MockPartRepository([Part(defaultsPointer, defaultsEdl)].concat(defaultsLinksParts));

    let defaults = DefaultsDocModel(repo);

    expect(Object.values(defaults.links)).toHaveLength(defaultsEdl.links.length);
  });
});
