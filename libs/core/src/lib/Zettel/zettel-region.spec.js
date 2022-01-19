import { describe, it, expect } from '@jest/globals';
import { Endset, Link } from '../model';
import { ZettelRegion } from './zettel-region';
import { RenderEndset } from './render-endset';
import { RenderLink } from './render-link';

function make(...endsets) {
  return ZettelRegion(endsets);
}

function makeEndsetsForLink(...endsetNames) {
  let endsets = endsetNames.map(n => Endset(n, []));
  let link = RenderLink(Link("foo", ...endsets));
  return endsets.map(e => RenderEndset(e, link));
}

describe('renderEndsetsNotInOther', () => {
  it('returns an empty array if neither ZettelSegment has any links', () => {
    expect(make().renderEndsetsNotInOther(make())).toHaveLength(0);
  });

  it('returns an empty array if both ZettelSegments have the same endsets', () => {
    let [endset] = makeEndsetsForLink("bar");
    let z1 = make(endset), z2 = make(endset);

    expect(z1.renderEndsetsNotInOther(z2)).toHaveLength(0);
  });

  it('returns an endset if it is in this but not that', () => {
    let [endset] = makeEndsetsForLink("bar");
    let z1 = make(endset), z2 = make();

    expect(z1.renderEndsetsNotInOther(z2)[0]).toEqual[endset];
  });

  it('does not return an endset if it is in that but not this', () => {
    let [endset] = makeEndsetsForLink("bar");
    let z1 = make(), z2 = make(endset);

    expect(z1.renderEndsetsNotInOther(z2)).toHaveLength(0);
  });
});

describe('sharedRenderEndsets', () => {
  it('returns endsets that the two zettel have in common', () => {
    let [endset1, endset2, endset3, endset4] = makeEndsetsForLink("bar1", "bar2", "bar3", "bar4");
    let n1 = make(endset1, endset2, endset3), n2 = make(endset2, endset3, endset4);

    expect(n1.sharedRenderEndsets(n2)).toHaveLength(2);
    expect(n1.sharedRenderEndsets(n2).map(e => e.name)).toEqual(["bar2", "bar3"]);
  });
});
