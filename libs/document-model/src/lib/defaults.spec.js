import { expect, it, describe } from '@jest/globals';
import { testing, Part } from '@commonplace/core';
import { DefaultsDocModel, defaultsPointer, defaultsEdl, defaultsLinks } from './defaults';

describe('DefaultsDocModel', () => {
  it('returns a valid DocModel', () => {
    let linkPairs = defaultsLinks.map((l, i) => Part(defaultsEdl.links[i], l));
    let repo = testing.MockPartRepository([Part(defaultsPointer, defaultsEdl)].concat(linkPairs));
    
    let defaults = DefaultsDocModel(repo);

    expect(Object.values(defaults.links)).toHaveLength(defaultsEdl.links.length);
  });
});
