import { describe, expect, it } from '@jest/globals';
import { Link, Edl, Span, EdlPointer, LinkPointer, Part, PartRepository, defaultsPointer } from '@commonplace/core';
import { TestPouncer } from './pouncer';

async function make(docPointer, nameContentPairs = []) {
  let repo = PartRepository({ getPart: () => {
      return [false, undefined];
    }
  });

  return TestPouncer(repo, docPointer, nameContentPairs.map(pair => Part(pair[0], pair[1])));
}

function anEdl(clips = [], links = []) {
  return [EdlPointer("p"), makeEdl(clips, links)];
}

function aLink(n = 1, linkContent, type) {
  type = type ?? n.toString();
  let content = linkContent ? aClip(100 + n) : [];
  let ends = linkContent ? [["content", [content[0]]]] : [];
  return [
    LinkPointer(n.toString()),
    Link(type, ...ends), ...content
  ];
}

function aClip(n = 1) {
  return [Span("or", n, 10), "x".repeat(n+10)];
}

function makeEdl(clips = [], links = []) {
  return Edl(undefined, clips.map(x => x[0]), links.map(x => x[0]));
}

describe('docStatus', () => {
  describe('before defaults', () => {
    function makeDefaults() {
      return [defaultsPointer, makeEdl([], [[LinkPointer("first default")], [LinkPointer("second default")]])];
    }

    it('initially requests the defaults Edl', async () => {
      let edlPointer = EdlPointer("p");

      let pouncer = (await make(edlPointer));
      expect(pouncer.docStatus().required).toEqual([defaultsPointer]);
    });

    it('all predicates are initially false', async () => {
      let edlPointer = EdlPointer("p");

      let result = (await make(edlPointer)).docStatus();

      expect(result.defaultsDocAvailable).toBeFalsy();
      expect(result.defaultsLinksAvailable).toBeFalsy();
      expect(result.linksAvailable).toBeFalsy();
      expect(result.linkContentAvailable).toBeFalsy();
      expect(result.docContentAvailable).toBeFalsy();
      expect(result.allAvailable).toBeFalsy();
    });

    it('has defaultsDocAvailable set to truthy if the defaults doc is in the cache', async () => {
      let edlPointer = EdlPointer("p");

      expect((await make(edlPointer, [makeDefaults()])).docStatus().defaultsDocAvailable).toBeTruthy();
    });

    it('has defaultsLinksAvailable set to falsy if the defaults links are not yet in the cache', async () => {
      let edlPointer = EdlPointer("p");

      expect((await make([edlPointer, makeDefaults()])).docStatus().defaultsLinksAvailable).toBeFalsy();
    });

    it('requests default links that are not in the cache', async () => {
      let edlPointer = EdlPointer("p");

      expect((await make(edlPointer, [
        makeDefaults(),
        [LinkPointer("first default"), Link("1st")]
      ])).docStatus().required).toEqual([LinkPointer("second default")]);
    });

    it('requests the type link of a default link once the link is in the cache', async () => {
      let edlPointer = EdlPointer("p");

      expect((await make(edlPointer, [
        makeDefaults(),
        [LinkPointer("first default"), Link(LinkPointer("type link"))],
        [LinkPointer("second default"), Link("2nd")]
      ])).docStatus().required).toEqual([LinkPointer("type link")]);
    });

    it('requests type links recursively', async () => {
      let edlPointer = EdlPointer("p");

      expect((await make(edlPointer, [
        makeDefaults(),
        [LinkPointer("first default"), Link(LinkPointer("type link"))],
        [LinkPointer("second default"), Link("2nd")],
        [LinkPointer("type link"), Link(LinkPointer("second type link"))]
      ])).docStatus().required).toEqual([LinkPointer("second type link")]);
    });

    it('has defaultsLinksAvailable set to truthy once the defaults links and their types are in the cache', async () => {
      let edlPointer = EdlPointer("p");

      expect((await make(edlPointer, [
        makeDefaults(),
        [LinkPointer("first default"), Link("1st")],
        [LinkPointer("second default"), Link(LinkPointer("type link"))],
        [LinkPointer("type link"), Link("type link")]
      ])).docStatus().defaultsLinksAvailable).toBeTruthy();
    });
  });

  describe('after defaults downloaded', () => {
    it('requests the Edl', async () => {
      let edlPointer = EdlPointer("p");

      expect((await make(edlPointer, [[defaultsPointer, makeEdl()]])).docStatus().required).toEqual([edlPointer]);
    });

    it('has docAvailable set to truthy if the doc is in the cache', async () => {
      let edlPointer = EdlPointer("p");

      expect((await make(edlPointer, [[defaultsPointer, makeEdl()], [edlPointer, makeEdl()]]))
        .docStatus().docAvailable).toBeTruthy();
    });
  });

  describe('after EDL downloaded', () => {
    async function makeAndGetDocStatus(clips = [], links = [], cached = []) {
      let edlPair = anEdl(clips, links);
      return (await make(edlPair[0], [[defaultsPointer, makeEdl()], edlPair, ...cached])).docStatus();
    }

    it('has all statuses set to truthy if the doc is available and contains nothing', async () => {
      let result = await makeAndGetDocStatus();

      expect(result.defaultsDocAvailable).toBeTruthy();
      expect(result.defaultsLinksAvailable).toBeTruthy();
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

    it('starts requesting the type link for a link once it has been downloaded', async () => {
      let link = aLink(1, undefined, LinkPointer("type link"));

      let required = (await makeAndGetDocStatus([], [link], [link])).required;

      expect(required).toEqual([LinkPointer("type link")]);
    });

    it('requests type links recursively', async () => {
      let link = aLink(1, undefined, LinkPointer("2"));
      let typeLink = aLink(2, undefined, LinkPointer("second type link"));

      let required = (await makeAndGetDocStatus([], [link], [link, typeLink])).required;

      expect(required).toEqual([LinkPointer("second type link")]);
    });

    it('starts requesting link content once the link has been downloaded', async () => {
      let link = aLink(1, true);

      let required = (await makeAndGetDocStatus([], [link], [link])).required;

      expect(required).toContain(link[2]);
    });

    it('stops requesting a clip once it has been downloaded', async () => {
      let clip = aClip();

      let required = (await makeAndGetDocStatus([clip], [], [clip])).required;

      expect(required).toEqual([]);
    });

    it('starts requesting the links in a type link', async () => {
      let link = aLink(1, undefined, LinkPointer("type link"));
      let typeLink = Link("type", [undefined, [LinkPointer("child")]]);


      let required = (await makeAndGetDocStatus([], [link], [link, [LinkPointer("type link"), typeLink]])).required;

      expect(required).toEqual([LinkPointer("child")]);
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
});