import { describe, expect, it } from '@jest/globals';
import { DocumentModelBuilder } from './document-model-builder';
import { Doc, Part, LinkPointer, Link } from '@commonplace/core';

function make(...links) {
  let parts = links.filter(x => x[1]).map(x => Part(LinkPointer(x[0]), Link(x[0])));
  let repo = { getPartLocally: pointer => parts.find(p => p.pointer.hashableName === pointer.hashableName) };
  let builder = DocumentModelBuilder(Doc([], links.map(x => LinkPointer(x[0]))), repo);
  let model = builder.build();
  return model;
}

describe('build', () => {
  describe('links', () => {
    it('returns an empty object of links when the doc has no links', () => {
      expect(make().links).toEqual({});
    });

    it('returns a link under its hashable name if it is present in the repo', () => {
      expect(make(["link1", true]).links[LinkPointer("link1").hashableName].type).toEqual("link1");
    });

    it('does not return a link under its hashable name if it is NOT present in the repo', () => {
      expect(make(["link1", false]).links[LinkPointer("link1").hashableName]).toBeFalsy();
    });
  });
});