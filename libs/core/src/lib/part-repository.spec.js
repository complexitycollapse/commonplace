import { describe, expect, it } from '@jest/globals';
import { Link, Edl } from './model';
import { Span, EdlPointer, LinkPointer } from './pointers';
import { Part } from './part';
import { PartRepository } from './part-repository';

async function make(nameContentPairs = []) {
  let repo = PartRepository({ getPart: p => {
      let pair = nameContentPairs.find(x => x[0] === p);
      return pair ? [true, Part(pair[0], pair[1])] : [false, undefined];
    }
  });
  for (let n of nameContentPairs) {
    await repo.getPart(n[0]);
  }

  return repo;
}

function anEdl(clips = [], links = []) {
  return [EdlPointer("p"), makeEdl(clips, links)];
}

function aLink(n = 1, linkContent) {
  let content = linkContent ? aClip(100 + n) : [];
  let ends = linkContent ? [["content", [content[0]]]] : [];
  return [LinkPointer(n.toString()), Link(n.toString(), ...ends), ...content];
}

function aClip(n = 1) {
  return [Span("or", n, 10), "x".repeat(n+10)];
}

function makeEdl(clips = [], links = []) {
  return Edl(undefined, clips.map(x => x[0]), links.map(x => x[0]));
}

function resolve(request, value) {
  request[1].call(undefined, Part(request[0], value));
}

describe('docStatus', () => {
  it('initially requests the EDL', async () => {
    let edlPointer = EdlPointer("p");

    expect((await make()).docStatus(edlPointer).required).toEqual([edlPointer]);
  });

  it('initially requests the EDL', async () => {
    let edlPointer = EdlPointer("p");

    let result = (await make()).docStatus(edlPointer);

    expect(result.docAvailable).toBeFalsy();
    expect(result.linksAvailable).toBeFalsy();
    expect(result.linkContentAvailable).toBeFalsy();
    expect(result.docContentAvailable).toBeFalsy();
    expect(result.allAvailable).toBeFalsy();
  });

  it('has docAvailable truthy if the doc is in the cache', async () => {
    let edlPointer = EdlPointer("p");

    expect((await make([[edlPointer, makeEdl()]])).docStatus(edlPointer).docAvailable).toBeTruthy();
  });

  describe('after EDL downloaded', () => {
    async function makeAndGetDocStatus(clips = [], links = [], cached = []) {
      let edlPair = anEdl(clips, links);
      return (await make([edlPair, ...cached])).docStatus(edlPair[0]);
    }

    it('has all statuses set to truthy if the doc is available and contains nothing', async () => {
      let result = await makeAndGetDocStatus();

      expect(result.docAvailable).toBeTruthy();
      expect(result.linksAvailable).toBeTruthy();
      expect(result.linkContentAvailable).toBeTruthy();
      expect(result.docContentAvailable).toBeTruthy();
      expect(result.allAvailable).toBeTruthy();
    });

    it('stops requesting the EDL', async () => {
      expect((await makeAndGetDocStatus()).required).toEqual([]);
    });

    it('starts requesting the EDL clips and links', async () => {
      let clip = aClip(), link = aLink(1);

      let required = (await makeAndGetDocStatus([clip], [link])).required;

      expect(required).toContain(clip[0]);
      expect(required).toContain(link[0]);
    });

    it('stops requesting a link once it has been downloaded', async () => {
      let link = aLink(1);

      let required = (await makeAndGetDocStatus([], [link], [link])).required;

      expect(required).toEqual([]);
    });

    it('stops requesting a clip once it has been downloaded', async () => {
      let clip = aClip();

      let required = (await makeAndGetDocStatus([clip], [], [clip])).required;

      expect(required).toEqual([]);
    });

    it('starts requesting link content once the link has been downloaded', async () => {
      let link = aLink(1, true);

      let required = (await makeAndGetDocStatus([], [link], [link])).required;

      expect(required).toContain(link[2]);
    });

    it('stops requesting link content once the link content has been downloaded', async () => {
      let link = aLink(1, true);

      let required = (await makeAndGetDocStatus([], [link], [link, link.slice(2, 4)])).required;

      expect(required).not.toContain(link[2]);
    });

    it('starts requesting the clips and links of a child Edl once it has been downloaded', async () => {
      let clip = aClip(), link = aLink(1);
      let edl = anEdl([clip], [link]);

      let required = (await makeAndGetDocStatus([clip], [link], [edl])).required;

      expect(required).toContain(clip[0]);
      expect(required).toContain(link[0]);
    });

    it('stops requesting the clips and links of a child Edl once they have been downloaded', async () => {
      let clip = aClip(), link = aLink(1);
      let edl = anEdl([clip], [link]);

      let required = (await makeAndGetDocStatus([clip], [link], [edl, clip, link])).required;

      expect(required).toEqual([]);
    });
  });

  describe("child zettel", () => {
  //   it('creates a child Zettel for each clip of content (in case where there are no links that split the clips)', async () => {
  //     let ez = make(makeEdl([Span("x", 1, 10), Image("y", 1, 2, 3, 4)]));

  //     expect(ez.children.length).toBe(2);
  //   });

  //   it('sets containingEdl on the child zettel to itself', async () => {
  //     let ez = make(makeEdl([Span("x", 1, 10)]));

  //     expect(ez.children[0].containingEdl).toBe(ez);
  //   });

  //   it('sets clip on the child zettel to the original clip', async () => {
  //     let clip = Span("x", 1, 10);
  //     let ez = make(makeEdl([clip]));

  //     expect(ez.children[0].clip).toBe(clip);
  //   });
  });

  describe('nested EDLs', () => {
  //   it('returns a request for the child EDL', async () => {
  //     let childEdlPointer = EdlPointer("name");
  //     let ez = make(makeEdl([childEdlPointer]));

  //     expect(ez.outstandingRequests()[0][0]).toBe(childEdlPointer);
  //   });

  //   it('does not request the child EDL once it has been resolved', async () => {
  //     let childEdlPointer = EdlPointer("name");
  //     let childEdl = makeEdl();
  //     let ez = make(makeEdl([childEdlPointer]));
  //     let firstRequest = ez.outstandingRequests()[0];

  //     resolve(firstRequest, childEdl);

  //     expect(ez.outstandingRequests()).toEqual([]);
  //   });

  //   it('replaces the dummy EDL with an EdlZettel for the resolved EDL', async () => {
  //     let childEdlPointer = EdlPointer("name");
  //     let childEdl = makeEdl();
  //     let ez = make(makeEdl([childEdlPointer]));
  //     let firstRequest = ez.outstandingRequests()[0];

  //     resolve(firstRequest, childEdl);

  //     expect(ez.children[0].edl).toBe(childEdl);
  //   });

  //   it('requests all content of a resolved child EDL', async () => {
  //     let clips = [Span("x", 1, 10), Image("y", 0, 0, 100, 100)];
  //     let childEdlPointer = EdlPointer("name");
  //     let childEdl = makeEdl(clips);
  //     let ez = make(makeEdl([childEdlPointer]));
  //     let firstRequest = ez.outstandingRequests()[0];
  //     resolve(firstRequest, childEdl);

  //     let actualRequests = ez.outstandingRequests();

  //     expect(actualRequests.map(x => x[0])).toEqual(clips);
  //   });
  });
});
