import { describe, it, expect, test } from '@jest/globals';
import { Endset, Link } from '@commonplace/core';
import { Node } from './node';

function make(...endsets) {
  return Node(endsets);
}

function makeEndsetsForLink(...endsetNames) {
  let endsets = endsetNames.map(n => Endset(n, []));
  let link = Link("foo", ...endsets);
  endsets.forEach((e, i) => {
    e.link = link;
    e.index = i;
  });
  return endsets;
}

describe('endsetsNotInOther', () => {
  it('returns an empty array if neither Node has any links', () => {
    expect(make().endsetsNotInOther(make())).toHaveLength(0);
  });

  it('returns an empty array if both Nodes have the same endsets', () => {
    let [endset] = makeEndsetsForLink("bar");
    let z1 = make(endset), z2 = make(endset);

    expect(z1.endsetsNotInOther(z2)).toHaveLength(0);
  });

  it('returns an endset if it is in this but not that', () => {
    let [endset] = makeEndsetsForLink("bar");
    let z1 = make(endset), z2 = make();

    expect(z1.endsetsNotInOther(z2)[0]).toEqual[endset];
  });

  it('does not return an endset if it is in that but not this', () => {
    let [endset] = makeEndsetsForLink("bar");
    let z1 = make(), z2 = make(endset);

    expect(z1.endsetsNotInOther(z2)).toHaveLength(0);
  });
});

describe('sharedEndsets', () => {
  it('returns endsets that the two zettel have in common', () => {
    let [endset1, endset2, endset3, endset4] = makeEndsetsForLink("bar1", "bar2", "bar3", "bar4");
    let n1 = make(endset1, endset2, endset3), n2 = make(endset2, endset3, endset4);

    expect(n1.sharedEndsets(n2)).toHaveLength(2);
    expect(n1.sharedEndsets(n2).map(e => e.name)).toEqual(["bar2", "bar3"]);
  });
});
