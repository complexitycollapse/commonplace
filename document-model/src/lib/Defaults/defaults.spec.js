import { expect, it, describe } from '@jest/globals';
import { Part } from '@commonplace/core';
import { DefaultsDocModel, defaultsEdl, defaultsLinksParts } from './defaults';
import { defaultsPointer } from '../well-known-objects';
import { createTestCache } from '../Testing/docuverse-builder';

describe('DefaultsDocModel', () => {
  it('returns a valid DocModel', () => {
    let cache = createTestCache([Part(defaultsPointer, defaultsEdl)].concat(defaultsLinksParts), true);

    let defaults = DefaultsDocModel(cache);

    expect(Array.from(defaults.links.values())).toHaveLength(defaultsEdl.links.length);
  });
});
