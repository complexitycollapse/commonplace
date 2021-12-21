import { describe, it, expect, test } from '@jest/globals';
import { Endset } from '@commonplace/core';
import { Node } from './node';

function make(...endsets) {
  return Node(endsets);
}

describe('endsetsNotInOther', () => {
  it('returns an empty array if neither Node has any links', () => {
    expect(make().endsetsNotInOther(make())).toHaveLength(0);
  });

  it('returns an empty array if both Nodes have the same endsets', () => {
    let endset = Endset("bar", []);
    let z1 = make(endset), z2 = make(endset);

    expect(z1.endsetsNotInOther(z2)).toHaveLength(0);
  });

  it('returns an endset if it is in this but not that', () => {
    let endset = Endset("bar", []);
    let z1 = make(endset), z2 = make();

    expect(z1.endsetsNotInOther(z2)[0]).toEqual[endset];
  });

  it('does not return an endset if it is in that but not this', () => {
    let endset = Endset("bar", []);
    let z1 = make(), z2 = make(endset);

    expect(z1.endsetsNotInOther(z2)).toHaveLength(0);
  });
});
