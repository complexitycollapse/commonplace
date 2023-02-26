import { it, describe, expect, test } from '@jest/globals';
import { SequenceBuildingCursor2 } from './sequence-building-cursor2';
import { aMetalink, anEdl, aSpan, aTargetLink, aTargetLink2, makeEdlzAndReturnSequnceDetails, makeEdlZ } from '../Groups/group-testing';
import { SequencePrototype } from './sequence-prototype';
import { LinkPointer } from '@commonplace/core';
import { Zettel } from './zettel';
import { IncomingPointer } from './IncomingPointer';
import { DocumentModelLink } from './document-model-link';
import { EdlModel } from './edl-model';

function make(content, links) {
  let sequenceDetailsEndowments = makeEdlzAndReturnSequnceDetails(content, links);
  let scenario = {};
  let cursors = sequenceDetailsEndowments.map(d => SequenceBuildingCursor2(d))[0];
  scenario.consumeZettel = clipBuilder => {
    let clip = clipBuilder.build();
    let zettel = clipBuilder.edlZ.children.find(z => z.clip.denotesSame(clip));
    return cursors.consumeZettel(zettel);
  };
  return scenario;
}

function make2(sequenceElements) {
  let scenario = {};
  let sequenceLinkBuilder = aTargetLink2(sequenceElements, {end: "grouping end"});
  let sequenceLink = DocumentModelLink(sequenceLinkBuilder.build(), 0, LinkPointer("group"), 0);
  let sequenceEnd = sequenceLink.getEnd("grouping end");
  let prototype = SequencePrototype("test type", sequenceEnd, sequenceLink, LinkPointer("metalink"));
  sequenceEnd.sequencePrototypes = [prototype];
  
  scenario.cursor = SequenceBuildingCursor2(prototype);
  scenario.consumeZettel = clipBuilder => {
    let clip = clipBuilder.build();
    let incomingPointer = IncomingPointer(clipBuilder.pointer, sequenceEnd, sequenceLink);
    return scenario.cursor.consumeZettel(Zettel(clip, [incomingPointer]))
  }
  scenario.consumeEdl = edlBuilder => {
    let edl = edlBuilder.build();
    let incomingPointer = IncomingPointer(edlBuilder.pointer, sequenceEnd, sequenceLink);
    return scenario.cursor.consumeZettel(EdlModel(edlBuilder.pointer, edl.type, [], [], undefined, [incomingPointer]));
  }

  return scenario;
}

function getCursorForLink(edlZ, link) {
  let renderLink = edlZ.renderLinks.find(l => l.pointer.denotesSame(link.pointer));
  let sequenceDetails = renderLink.sequenceDetailsEndowmentPrototypes(renderLink.renderEnds.find(e => e.name === "grouping end"))[0];
  return SequenceBuildingCursor2(sequenceDetails);
}

function makescenarioAndChildSequences(contents, parentSequenceLinks, childSequenceLinks) {
  let edlZ = makeEdlZ(contents, [...childSequenceLinks, ...parentSequenceLinks].map(l => [l, aMetalink(l)]).flat());
  let childSequences = [];
  childSequenceLinks.forEach(l => {
    let scenario = getCursorForLink(edlZ, l);
    contents.forEach(s => scenario.consumeZettel(s));
    childSequences.push(scenario.pushSequence());
  });
  
  let scenarios = parentSequenceLinks.map(l => getCursorForLink(edlZ, l));
  return [scenarios, ...childSequences];
}

describe('consumeZettel', () => {
  it('returns true if clip matches the first pointer in the endset (Span case)', () => {
    let span1 = aSpan(1), span2 = aSpan(2);

    expect(make2([span1, span2]).consumeZettel(span1)).toBe(true);
  });

  it('returns true if clip matches the first pointer in the endset (EDL case)', () => {
    let edl1 = anEdl("edl1"), span2 = aSpan(2);

    expect(make2([edl1, span2]).consumeEdl(edl1)).toBe(true);
  });

  it('returns false if clip does not match the first pointer in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);

    expect(make2([span1, span2]).consumeZettel(span2)).toBe(false);
  });

  it('returns false if clip does not match the first pointer in the endset (EDL case)', () => {
    let edl1 = anEdl("edl1"), edl2 = anEdl("end2"), span2 = aSpan(2);

    expect(make2([edl1, span2, edl2]).consumeEdl(edl2)).toBe(false);
  });

  it('returns false if clip matches second, not first, pointer in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);

    expect(make2([span1, span2]).consumeZettel(span2)).toBe(false);
  });

  it('returns false on the second call if the second pointer does not match the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2), span3 = aSpan(3);

    let scenario = make2([span1, span2, span3]);
    
    expect(scenario.consumeZettel(span1)).toBe(true);
    expect(scenario.consumeZettel(span3)).toBe(false);
  });

  it('returns true on the second call if the second pointer matches the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);

    let scenario = make2([span1, span2]);
    
    expect(scenario.consumeZettel(span1)).toBe(true);
    expect(scenario.consumeZettel(span2)).toBe(true);
  });

    it('returns true if clip matches the beginning of the first pointer in the end', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);

    expect(make2([wholeSpan]).consumeZettel(prefix)).toBe(true);
  });

  it('returns false if clip matches the beginning of the first pointer but not the rest', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20), nextSpan = aSpan(2);
    let scenario = make2([wholeSpan]);

    expect(scenario.consumeZettel(prefix)).toBe(true);
    expect(scenario.consumeZettel(nextSpan)).toBe(false);
  });

  it('returns true if clip matches the beginning of the first pointer and then the rest of the first pointer', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
    let remaining = aSpan(1, 10).withStart(prefix.build().next);
    let scenario = make2([prefix, remaining, wholeSpan]);

    expect(scenario.consumeZettel(prefix)).toBe(true);
    expect(scenario.consumeZettel(remaining)).toBe(true);
  });
});

describe('consumeSequence', () => {
  it('returns true when the required sequence matches the given one', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let [[scenario], childSequence] = makescenarioAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink]);

    expect(scenario.consumeSequence(childSequence)).toBe(true);
  });

  it('returns false when the required sequence does not match the given one', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let wrongSequenceLink = aTargetLink([span1, span2], { name: "wrong"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let [[scenario], , wrongSequence] = makescenarioAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink, wrongSequenceLink]);

    expect(scenario.consumeSequence(wrongSequence)).toBe(false);
  });

  it('will consume zettel in the child sequence once the child sequence is consumed', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let [[scenario], childSequence] = makescenarioAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink]);
    scenario.consumeSequence(childSequence)

    expect(scenario.consumeZettel(span1)).toBe(true);
    expect(scenario.consumeZettel(span2)).toBe(true);
  });

  it('will throw an return false if the zettel passed in after consuming a sequence do not match that sequence', () => {
    let span1 = aSpan(1), span2 = aSpan(2), span3 = aSpan(3);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink, span3], { name: "parent" });
    let [[scenario], childSequence] = makescenarioAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink]);
    scenario.consumeSequence(childSequence);

    expect(scenario.consumeZettel(span2)).toBe(false);
  });

  test('consumeZettel will return false if the zettel is a member of a child sequence but consumeSequence was not called first', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let [[scenario]] = makescenarioAndChildSequences([span1, span2], [parentSequenceLink], [childSequenceLink]);

    expect(scenario.consumeZettel(span1)).toBe(false);
  });

  it('returns true if a second level sequence matches', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });
    let grandparentSequenceLink = aTargetLink([parentSequenceLink], { name: "grandparent" });
    let [[parentscenario, grandparentscenario], childSequence] =
      makescenarioAndChildSequences([span1, span2], [parentSequenceLink, grandparentSequenceLink], [childSequenceLink]);
    parentscenario.consumeSequence(childSequence);
    parentscenario.consumeZettel(span1);
    parentscenario.consumeZettel(span2);
    let parentSequence = parentscenario.pushSequence();
  
    expect(grandparentscenario.consumeSequence(parentSequence)).toBe(true);
  });
});

describe('isComplete', () => {
  it('returns false if consumeZettel has not been called', () => {
    let span = aSpan();
    let target = aTargetLink([span]);

    expect(make([span], [target, aMetalink(target)]).isComplete()).toBe(false);
  });

  it('returns false if consumeZettel did not match the first pointer', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1]);
    let scenario = make([span1, span2], [target, aMetalink(target)]);

    scenario.consumeZettel(span2);
    
    expect(scenario.isComplete()).toBe(false);
  });

  it('returns true if consumeZettel matched the only pointer in the end', () => {
    let span = aSpan();
    let target = aTargetLink([span]);
    let scenario = make([span], [target, aMetalink(target)]);

    scenario.consumeZettel(span);

    expect(scenario.isComplete()).toBe(true);
  });

  it('returns false if consumeZettel matched the first pointer but there is still another in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);
    let scenario = make([span1, span2], [target, aMetalink(target)]);

    scenario.consumeZettel(span1);

    expect(scenario.isComplete()).toBe(false);
  });

  it('returns false if consumeZettel matched only the beginning of the span', () => {
    let prefix = aSpan(1, 10), wholeSpan = aSpan(1, 20);
    let target = aTargetLink([wholeSpan]);
    let scenario = make([prefix], [target, aMetalink(target)]);

    scenario.consumeZettel(prefix);

    expect(scenario.isComplete()).toBe(false);
  });

  it('returns true if consumeZettel matched all pointers in the end', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);
    let scenario = make([span1, span2], [target, aMetalink(target)]);

    scenario.consumeZettel(span1);
    scenario.consumeZettel(span2);

    expect(scenario.isComplete()).toBe(true);
  });
});

describe('pushSequence', () => {
  it('throws an exception if the sequence is not complete', () => {
    let span = aSpan();
    let target = aTargetLink([span]);

    expect(() => make([span], [target, aMetalink(target)]).pushSequence()).toThrow();
  });

  it('does not throw if the sequence is complete', () => {
    let span = aSpan();
    let target = aTargetLink([span]);
    let scenario = make([span], [target, aMetalink(target)]);

    scenario.consumeZettel(span);

    expect(() => scenario.pushSequence()).not.toThrow();
  });

  it('pushes the sequence on the sequences properties of the zettel in the sequence', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let target = aTargetLink([span1, span2]);
    
    // The EdlZettel will call pushSequence when it resolves its sequences
    make([span1, span2], [target, aMetalink(target)]);

    expect(span1.edlZ.children[0].sequences).toHaveLength(1);
    expect(span2.edlZ.children[1].sequences).toHaveLength(1);
  });

  it('pushes the parent sequence on the sequences properties of the child sequence links', () => {
    let span1 = aSpan(1), span2 = aSpan(2);
    let childSequenceLink = aTargetLink([span1, span2], { name: "child"});
    let parentSequenceLink = aTargetLink([childSequenceLink], { name: "parent" });

    // The EdlZettel will call pushSequence when it resolves its sequences
    make([span1, span2], [parentSequenceLink, childSequenceLink, aMetalink(parentSequenceLink), aMetalink(childSequenceLink)]);

    expect(span1.edlZ.renderLinks[1].sequences).toHaveLength(1);
  });
});
