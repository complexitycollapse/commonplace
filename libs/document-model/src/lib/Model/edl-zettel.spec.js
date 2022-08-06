import { describe, expect, it } from '@jest/globals';
import { Link, Edl } from '@commonplace/core';
import { defaultsPointer, EdlZettel, makeTestEdlZettel } from './edl-zettel';
import { Span, Box, EdlPointer, LinkPointer } from '@commonplace/core';
import { Part } from '@commonplace/core';

let make = makeTestEdlZettel;

function makeEdl(clips = [], links = []) {
  return Edl(undefined, clips, links);
}

function resolve(request, value) {
  request[1].call(undefined, Part(request[0], value));
}

describe('basic properties', () => {
  it('sets the key property', () => {
    expect(make(makeEdl(), { key: "123" }).key).toBe("123");
  });

  it('sets the parent property', () => {
    let parent = make(makeEdl());
    expect(make(makeEdl(), { parent }).parent).toBe(parent);
  });

  it('sets the hashableName property to the hashable name the EDL pointer', () => {
    let edlPointer = EdlPointer("some name", 10);
    expect(make(makeEdl(), { edlPointer }).hashableName).toBe(edlPointer.hashableName);
  });
});

describe('outstandingRequests', () => {
  it('initially requests the EDL', () => {
    let edlPointer = EdlPointer("p");
    
    expect(EdlZettel(edlPointer, undefined, undefined, "1").outstandingRequests().map(x => x[0])).toEqual([edlPointer]);
  });

  it('stops requesting the EDL once it has been resolved', () => {
    let edlPointer = EdlPointer("p");
    let ez = EdlZettel(edlPointer, undefined, undefined, "1");

    resolve(ez.outstandingRequests()[0], makeEdl())

    expect(ez.outstandingRequests()).toEqual([]);
  });

  describe('after EDL downloaded', () => {
    it('requests all links initially, but not content', () => {
      let links = [LinkPointer("1"), LinkPointer("2"), LinkPointer("3")];
      let ez = make(makeEdl([Span("x", 1, 10), EdlPointer("child")], links));
      
      let actualRequests = ez.outstandingRequests();

      expect(actualRequests.map(x => x[0])).toEqual(links);
    });

    it('stops requesting a link once it has been resolved', () => {
      let links = [LinkPointer("1"), LinkPointer("2"), LinkPointer("3")];
      let ez = make(makeEdl([Span("x", 1, 10), EdlPointer("child")], links));
      let initialRequests = ez.outstandingRequests();

      resolve(initialRequests[1], Link(undefined));

      expect(ez.outstandingRequests().map(x => x[0])).toEqual([links[0], links[2]]);
    });

    it('goes directly to requesting clips if the EDL has no links', () => {
      let clips = [Span("x", 1, 10), EdlPointer("child")];
      let ez = make(makeEdl(clips, []));

      expect(ez.outstandingRequests().map(x => x[0])).toEqual(clips);
    });

    it('requests link content once all links are resolved', () => {
      let clip = Span("x", 1, 10);
      let ez = make(makeEdl([], [LinkPointer("1")]));
      let initialRequests = ez.outstandingRequests();

      resolve(initialRequests[0], Link(undefined, [undefined, [ez.clip]], [undefined, [clip]]));

      expect(ez.outstandingRequests().map(x => x[0])).toEqual([clip]);
    });
  });

  describe('after links downloaded', () => {
    it('requests content for all pointers in all ends that point to content', () => {
      let links = [LinkPointer("1"), LinkPointer("2"), LinkPointer("3")];
      let clips = [Span("x", 1, 10), Box("y", 1, 1, 100, 100), Span("z", 10, 10)];
      let ez = make(makeEdl([], links));
      let initialRequests = ez.outstandingRequests();
      resolve(initialRequests[0], Link(undefined, [undefined, [ez.clip]], [undefined, [clips[0], clips[1]]]));
      resolve(initialRequests[1], Link(undefined, [undefined, [ez.clip]]));
      resolve(initialRequests[2], Link(undefined, [undefined, [ez.clip]], [undefined, [clips[2]]]));

      let requestedContent = ez.outstandingRequests().map(x => x[0]);

      expect(requestedContent).toHaveLength(3);
      expect(requestedContent).toEqual(expect.arrayContaining(clips));
    });

    it('requests clips once all link content is resolved', () => {
      let links = [LinkPointer("1"), LinkPointer("2"), LinkPointer("3")];
      let clips = [Span("x", 1, 10), EdlPointer("child")];
      let ez = make(makeEdl(clips, links));
      let initialRequests = ez.outstandingRequests();

      resolve(initialRequests[0], Link(undefined));
      resolve(initialRequests[1], Link(undefined));
      resolve(initialRequests[2], Link(undefined));

      expect(ez.outstandingRequests().map(x => x[0])).toEqual(clips);
    });
  });

  describe('after link content downloaded', () => { 
    it('stops returning a clip once it has been resolved', () => {
      let clips = [Span("x", 1, 10), Box("y", 0, 0, 100, 100)];
      let ez = make(makeEdl(clips));
      let firstRequest = ez.outstandingRequests()[0];
  
      resolve(firstRequest, "0123456789");
  
      expect(ez.outstandingRequests().map(x => x[0])).toEqual(clips.slice(1));
    });
  });

  describe("child zettel", () => {
    it('creates a child Zettel for each clip of content (in case where there are no links that split the clips)', () => {
      let ez = make(makeEdl([Span("x", 1, 10), Box("y", 1, 2, 3, 4)]));
  
      expect(ez.children.length).toBe(2);
    });

    it('sets containingEdl on the child zettel to itself', () => {
      let ez = make(makeEdl([Span("x", 1, 10)]));
  
      expect(ez.children[0].containingEdl).toBe(ez);
    });

    it('sets clip on the child zettel to the original clip', () => {
      let clip = Span("x", 1, 10);
      let ez = make(makeEdl([clip]));
  
      expect(ez.children[0].clip).toBe(clip);
    });
  });

  describe('nested EDLs', () => {
    it('returns a request for the child EDL', () => {
      let childEdlPointer = EdlPointer("name");
      let ez = make(makeEdl([childEdlPointer]));

      expect(ez.outstandingRequests()[0][0]).toBe(childEdlPointer);
    });

    it('does not request the child EDL once it has been resolved', () => {
      let childEdlPointer = EdlPointer("name");
      let childEdl = makeEdl();
      let ez = make(makeEdl([childEdlPointer]));
      let firstRequest = ez.outstandingRequests()[0];

      resolve(firstRequest, childEdl);

      expect(ez.outstandingRequests()).toEqual([]);
    });

    it('replaces the dummy EDL with an EdlZettel for the resolved EDL', () => {
      let childEdlPointer = EdlPointer("name");
      let childEdl = makeEdl();
      let ez = make(makeEdl([childEdlPointer]));
      let firstRequest = ez.outstandingRequests()[0];

      resolve(firstRequest, childEdl);

      expect(ez.children[0].edl).toBe(childEdl);
    });

    it('requests all content of a resolved child EDL', () => {
      let clips = [Span("x", 1, 10), Box("y", 0, 0, 100, 100)];
      let childEdlPointer = EdlPointer("name");
      let childEdl = makeEdl(clips);
      let ez = make(makeEdl([childEdlPointer]));
      let firstRequest = ez.outstandingRequests()[0];
      resolve(firstRequest, childEdl);

      let actualRequests = ez.outstandingRequests();

      expect(actualRequests.map(x => x[0])).toEqual(clips);
    });
  });
});

describe('key', () => {
  it('sets the key of the EDL dummy to be a sub-key of the parent', () => {
    let ez = make(makeEdl([EdlPointer("name")]), { key: "parent" });
    let actualChild = ez.children[0];

    expect(actualChild.key).toBe("parent.0");
  });

  it('sets unique keys on each clip', () => {
    let ez = make(makeEdl(
      [EdlPointer("name"), EdlPointer("name2"), Span("x", 10, 100), Box("y", 1, 1, 10, 11)]), 
      { key: "parent" });

    expect(ez.children[0].key).toBe("parent.0");
    expect(ez.children[1].key).toBe("parent.1");
    expect(ez.children[2].key).toBe("parent.2.0");
    expect(ez.children[3].key).toBe("parent.3.0");
  });

  it('gives the same key to the resolved EdlZettel as it did to the dummy', () => {
    let childEdlPointer = EdlPointer("name");
    let childEdl = makeEdl();
    let ez = make(makeEdl([childEdlPointer]));
    let firstRequest = ez.outstandingRequests()[0];
    let expectedKey = ez.children[0].key;

    firstRequest[1].call(undefined, Part(firstRequest[0], childEdl));

    expect(ez.children[0].key).toEqual(expectedKey);
  });
});

describe('links to EDL', () => {
  it('will create a RenderPointer for a link in the EDL that points to the EDL', () => {
    let edlPointer = EdlPointer("name");
    let ez = make(makeEdl([], [LinkPointer("foo")]), { edlPointer: edlPointer });

    resolve(ez.outstandingRequests()[0], Link(undefined, [undefined, [edlPointer]]));

    expect(ez.renderPointers().map(p => p.pointer)).toEqual([edlPointer]);
  });

  it('will not create a render pointer if the link pointer points to a different EDL', () => {
    let edlPointer = EdlPointer("name");
    let ez = make(makeEdl([], [LinkPointer("foo")]), { edlPointer: edlPointer });

    resolve(ez.outstandingRequests()[0], Link(undefined, [undefined, [EdlPointer("something else")]]));

    expect(ez.renderPointers()).toEqual([]);
  });

  it('will create a render pointer for links in the parent that point to the child EDL', () => {
    let childPointer = EdlPointer("child");
    let parent = make(makeEdl([childPointer], [LinkPointer("foo")]));
    resolve(parent.outstandingRequests()[0], Link(undefined, [undefined, [childPointer]]));

    let child = make(makeEdl([], []), { parent: parent, edlPointer: childPointer });

    expect(child.renderPointers().map(p => p.pointer)).toEqual([childPointer]);
  });
});

describe('depth', () => {
  it('is 0 for an Edl with no parent', () => {
    expect(make(makeEdl()).depth()).toBe(0);
  });

  it('is 1 for an Edl with a parent that has no parent', () => {
    expect(make(makeEdl(), { parent: make(makeEdl()) }).depth()).toBe(1);
  });

  it('is 2 for an Edl with a parent that has a parent that has no parent', () => {
    expect(make(makeEdl(), { parent: make(makeEdl(), { parent: make(makeEdl()) }) }).depth()).toBe(2);
  });

  it('is -1 for the default EDL', () => {
    expect(make(makeEdl(), { edlPointer: defaultsPointer }).depth()).toBe(-1);
  });
});
