import { describe, expect, it } from '@jest/globals';
import { BoxModelBuilder } from './box-model-builder';
import {
  DocModelBuilderBuilder, EdlBuilder, MarkupBuilder, SequenceLinkBuilder, SpanBuilder, ImageBuilder
} from '../Testing/test-builders';

let unique = 1;
function aSpan() {
  return SpanBuilder().withOrigin((unique++).toString());
}

function anImage() {
  return ImageBuilder().withOrigin((unique++).toString());
}

function anEdl() {
  return EdlBuilder(unique++);
}

function aBoxLink(target) {
  return MarkupBuilder().endowsBoxTo(target);
}

function expectMemberMatches(box, memberIndex, clipBuilder) {
  expect(box.members[memberIndex].pointer).toMatchObject(clipBuilder.builtObject);
}

function makeModel(clips) {
  let builder = DocModelBuilderBuilder(EdlBuilder("doc").withClips(...clips));
  return builder;
}

function make(docModelBuilderBuilder) {
  let docModelBuilder = docModelBuilderBuilder.build();
  let docModel = docModelBuilder.build();
  docModelBuilderBuilder.model = docModel;
  let boxModelBuilder = BoxModelBuilder(docModel);
  let boxModel = boxModelBuilder.build();
  return boxModel;
}

describe('BoxModelBuilder', () => {
  it('returns an empty box for an empty document', () => {
    let box = make(makeModel([]));

    expect(box.members).toEqual([]);
  });

  it('sets isBox to true on the box', () => {
    let box = make(makeModel([]));

    expect(box.isBox).toBeTruthy();
  });

  it('sets isRootBox to true on the root box', () => {
    let box = make(makeModel([]));

    expect(box.isRootBox).toBeTruthy();
  });

  it('sets originObject to be the document model', () => {
    let model = makeModel([]);

    let box = make(model);

    expect(box.originObject).toBe(model.model);
  });

  it('adds the content of the document to the box', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let model = makeModel(spans);

    let box = make(model);

    expect(box.members).toHaveLength(3);
    expectMemberMatches(box, 0, spans[0]);
    expectMemberMatches(box, 1, spans[1]);
    expectMemberMatches(box, 2, spans[2]);
  });

  it('sets isRootBox to false on child boxes', () => {
    let spans = [aSpan()];
    let model = makeModel(spans);

    let box = make(model);

    expect(box.members[0].isRootBox).toBeFalsy();
  });

  it('never generates a box for a span, as a span is never a box', () => {
    let span = aSpan();
    let model = makeModel([span])
      .withLink(aBoxLink(span));

    let element = make(model).members[0];

    expect(element.markup.get("box")).toBeTruthy();
    expect(element.isBox).toBeFalsy();
  });

  it('never generates a box for an image, because images are themselves boxes', () => {
    let image = anImage();
    let model = makeModel([image])
      .withLink(aBoxLink(image));

    let element = make(model).members[0];

    expect(element.markup.get("box")).toBeTruthy();
    expect(element.isBox).toBeFalsy();
  });

  it('flattens a non-box sequence into the containing box', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let model = makeModel(spans).withSequenceLink(spans);

    let box = make(model);

    expect(box.members).toHaveLength(3);
    expectMemberMatches(box, 0, spans[0]);
    expectMemberMatches(box, 1, spans[1]);
    expectMemberMatches(box, 2, spans[2]);
  });

  it('creates a box for a box sequence', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let model = makeModel(spans).withBoxSequenceLink(spans);

    let box = make(model);

    expect(box.members).toHaveLength(1);
    expect(box.members[0].isBox);
    expect(box.members[0].originObject.isSequence).toBeTruthy();
  });

  it('sets the markup of the box to the markup of the defining ling of the box sequence that generated it', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let model = makeModel(spans).withBoxSequenceLink(spans);

    let box = make(model);

    expect(box.members[0].markup).toBe(model.model.rootSequences()[0].definingLink.markup);
  });

  it('adds the sequence content to the sequence box', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let model = makeModel(spans).withBoxSequenceLink(spans);

    let box = make(model).members[0];

    expect(box.members).toHaveLength(3);
    expectMemberMatches(box, 0, spans[0]);
    expectMemberMatches(box, 1, spans[1]);
    expectMemberMatches(box, 2, spans[2]);
  });

  it('flattens a child sequence that is not a box into the box parent', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let childSequenceLinks = SequenceLinkBuilder(spans);
    let model = makeModel(spans)
      .withLinks(childSequenceLinks.link, childSequenceLinks.metalink)
      .withBoxSequenceLink([childSequenceLinks.link])
      .withExtraLinks([childSequenceLinks.type, childSequenceLinks.metalink]);

    let box = make(model).members[0];

    expect(box.members).toHaveLength(3);
    expectMemberMatches(box, 0, spans[0]);
    expectMemberMatches(box, 1, spans[1]);
    expectMemberMatches(box, 2, spans[2]);
  });

  it('does not flatten a child sequence that is a box', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let childSequenceLinks = SequenceLinkBuilder(spans);
    let model = makeModel(spans)
      .withLinks(childSequenceLinks.link, childSequenceLinks.metalink)
      .withLink(aBoxLink(childSequenceLinks.link))
      .withBoxSequenceLink([childSequenceLinks.link])
      .withExtraLinks([childSequenceLinks.type, childSequenceLinks.metalink]);

    let box = make(model).members[0];

    expect(box.members).toHaveLength(1);
    expect(box.members[0].members).toHaveLength(3);
  });

  it('places all spans in the root box', () => {
    // This test is for a bug where duplicate root boxes were being created. The cause
    // was that a box was being created for each span, rather than subsequent spans
    // being skipped because they have already been placed in a box.

    let spans = [aSpan(), aSpan(), aSpan()];
    let childSequenceLinks = SequenceLinkBuilder(spans);
    let model = makeModel(spans)
      .withLinks(childSequenceLinks.link, childSequenceLinks.metalink)
      .withLink(aBoxLink(childSequenceLinks.link))
      .withBoxSequenceLink([childSequenceLinks.link])
      .withExtraLinks([childSequenceLinks.type, childSequenceLinks.metalink]);

    let boxModel = make(model);
    expect(boxModel.members).toHaveLength(1);
  });

  it('creates implicit boxes around a box sequence if that content is not in an explicit box', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let model = makeModel(spans).withBoxSequenceLink([spans[1]]);

    let box = make(model);

    expect(box.members).toHaveLength(3);
    expect(box.members[0].originObject).toBe(undefined);
    expectMemberMatches(box.members[0], 0, spans[0]);
    expect(box.members[2].originObject).toBe(undefined);
    expectMemberMatches(box.members[2], 0, spans[2]);
  });

  it('sets the markup of an implicit box to an empty markup value', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let model = makeModel(spans).withBoxSequenceLink([spans[1]]);

    let box = make(model);

    expect([...box.members[0].markup.entries()]).toEqual([]);
  });

  it('creates implicit boxes within a box sequence if it contains content and other box sequences', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let childSequenceLinks = SequenceLinkBuilder([spans[1]]);
    let model = makeModel(spans)
      .withLinks(childSequenceLinks.link, childSequenceLinks.metalink)
      .withLink(aBoxLink(childSequenceLinks.link))
      .withBoxSequenceLink([spans[0], childSequenceLinks.link, spans[2]])
      .withExtraLinks([childSequenceLinks.type, childSequenceLinks.metalink]);

    let box = make(model).members[0];

    expect(box.members).toHaveLength(3);
    expect(box.members[0].originObject).toBe(undefined);
    expectMemberMatches(box.members[0], 0, spans[0]);
    expect(box.members[2].originObject).toBe(undefined);
    expectMemberMatches(box.members[2], 0, spans[2]);
  });

  it('will create nested boxes for every box sequence in a box sequence', () => {
    let spans = [aSpan(), aSpan()];
    let childSequenceLinks1 = SequenceLinkBuilder([spans[0]]);
    let childSequenceLinks2 = SequenceLinkBuilder([spans[1]]);
    let model = makeModel(spans)
      .withLinks(childSequenceLinks1.link, childSequenceLinks1.metalink)
      .withLinks(childSequenceLinks2.link, childSequenceLinks2.metalink)
      .withLink(aBoxLink(childSequenceLinks1.link))
      .withLink(aBoxLink(childSequenceLinks2.link))
      .withBoxSequenceLink([childSequenceLinks1.link, childSequenceLinks2.link])
      .withExtraLinks([childSequenceLinks1.type, childSequenceLinks1.metalink])
      .withExtraLinks([childSequenceLinks2.type, childSequenceLinks2.metalink]);

    let box = make(model).members[0];

    expect(box.members).toHaveLength(2);
    expect(box.members[0].originObject.definingLink.pointer).toEqual(childSequenceLinks1.link.pointer);
    expect(box.members[1].originObject.definingLink.pointer).toEqual(childSequenceLinks2.link.pointer);
  });

  it('will create unnested boxes for every box sequence in a non-box sequence', () => {
    let spans = [aSpan(), aSpan()];
    let childSequenceLinks1 = SequenceLinkBuilder([spans[0]]);
    let childSequenceLinks2 = SequenceLinkBuilder([spans[1]]);
    let model = makeModel(spans)
      .withLinks(childSequenceLinks1.link, childSequenceLinks1.metalink)
      .withLinks(childSequenceLinks2.link, childSequenceLinks2.metalink)
      .withLink(aBoxLink(childSequenceLinks1.link))
      .withLink(aBoxLink(childSequenceLinks2.link))
      .withSequenceLink([childSequenceLinks1.link, childSequenceLinks2.link])
      .withExtraLinks([childSequenceLinks1.type, childSequenceLinks1.metalink])
      .withExtraLinks([childSequenceLinks2.type, childSequenceLinks2.metalink]);

    let box = make(model);

    expect(box.members).toHaveLength(2);
    expect(box.members[0].originObject.definingLink.pointer).toEqual(childSequenceLinks1.link.pointer);
    expect(box.members[1].originObject.definingLink.pointer).toEqual(childSequenceLinks2.link.pointer);
  });

  it('flattens a non-box Edl', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let child = anEdl().withClips(...spans);
    let model = makeModel([child]);

    let box = make(model);

    expect(box.members).toHaveLength(3);
    expectMemberMatches(box, 0, spans[0]);
    expectMemberMatches(box, 1, spans[1]);
    expectMemberMatches(box, 2, spans[2]);
  });

  it('creates a box for a box Edl', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let child = anEdl().withClips(...spans);
    let model = makeModel([child]).withLink(aBoxLink(child));

    let box = make(model);

    expect(box.members).toHaveLength(1);
    expectMemberMatches(box.members[0], 0, spans[0]);
    expectMemberMatches(box.members[0], 1, spans[1]);
    expectMemberMatches(box.members[0], 2, spans[2]);
  });

  it('sets the markup of the box the the markup of the box Edl that generates it', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let child = anEdl().withClips(...spans);
    let model = makeModel([child]).withLink(aBoxLink(child));

    let box = make(model);

    expect(box.members[0].markup).toBe(model.model.zettel[0].markup);
  });

  it('creates implicit boxes around an Edl box if that content is not in an explicit box', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let child = anEdl().withClips(spans[1]);
    let model = makeModel([spans[0], child, spans[2]])
      .withLink(aBoxLink(child));

    let box = make(model);

    expect(box.members).toHaveLength(3);
    expect(box.members[0].originObject).toBe(undefined);
    expectMemberMatches(box.members[0], 0, spans[0]);
    expect(box.members[2].originObject).toBe(undefined);
    expectMemberMatches(box.members[2], 0, spans[2]);
  });

  it('creates implicit boxes within a box Edl if it contains content and other box Edls', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let child = anEdl().withClips(spans[1]).withName("child");
    let edl = anEdl().withClips(spans[0], child, spans[2]).withName("parent");
    let model = makeModel([edl])
      .withLink(aBoxLink(edl))
      .withLink(aBoxLink(child));

    let box = make(model).members[0];

    expect(box.members).toHaveLength(3);
    expect(box.members[0].originObject).toBe(undefined);
    expectMemberMatches(box.members[0], 0, spans[0]);
    expect(box.members[2].originObject).toBe(undefined);
    expectMemberMatches(box.members[2], 0, spans[2]);
  });

  it('creates nested boxes for box Edls in box sequences', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let child = anEdl().withClips(...spans);
    let model = makeModel([child])
      .withLink(aBoxLink(child))
      .withBoxSequenceLink([child]);

    let box = make(model);

    expect(box.members).toHaveLength(1);
    expect(box.members[0].members).toHaveLength(1);
    expect(box.members[0].members[0].originObject.isEdl).toBeTruthy();
  });

  it('creates nested boxes for box sequences in box Edls', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let sequence = SequenceLinkBuilder(spans);
    let edl = anEdl().withClips(...spans);
    let model = makeModel([edl])
      .withLinks(sequence.link, sequence.metalink)
      .withLink(aBoxLink(edl))
      .withLink(aBoxLink(sequence.link))
      .withExtraLinks([sequence.type, sequence.metalink]);

    let box = make(model);

    expect(box.members).toHaveLength(1);
    expect(box.members[0].members).toHaveLength(1);
    expect(box.members[0].members[0].originObject.isSequence).toBeTruthy();
  });

  it('flattens non-box Edls in box sequences', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let child = anEdl().withClips(...spans);
    let model = makeModel([child])
      .withBoxSequenceLink([child]);

    let box = make(model);

    expect(box.members).toHaveLength(1);
    expect(box.members[0].members).toHaveLength(3);
  });

  it('flattens non-box sequences in box Edls', () => {
    let spans = [aSpan(), aSpan(), aSpan()];
    let sequence = SequenceLinkBuilder(spans);
    let edl = anEdl().withClips(...spans);
    let model = makeModel([edl])
      .withLinks(sequence.link, sequence.metalink)
      .withLink(aBoxLink(edl))
      .withExtraLinks([sequence.type, sequence.metalink]);


    let box = make(model);

    expect(box.members).toHaveLength(1);
    expect(box.members[0].members).toHaveLength(3);
  });
});
