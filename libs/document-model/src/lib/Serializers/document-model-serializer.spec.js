import { describe, expect, it } from '@jest/globals';
import { DocuverseBuilder } from './Testing/docuverse-builder';
import { DocumentModelSerializer } from './document-model-serializer';

describe('DocumentModelSerializer.serialize', () => {
  it('serializes something without throwing an exception', () => {
    let dv = DocuverseBuilder().add(obj => ({
      edl: obj.anEdl(),
      dmb: obj.aDocModelBuilder(obj.edl)
    })).build();

    expect(() => DocumentModelSerializer(dv.dmb.build()).serialize()).not.toThrow();
  });

  it('returns a clean Json if the Edl is empty', () => {
    let dv = DocuverseBuilder().add(obj => ({
      edl: obj.anEdl(),
      dmb: obj.aDocModelBuilder(obj.edl)
    })).build();

    let json = DocumentModelSerializer(dv.dmb.build()).serialize();

    expect(json.zettel).toEqual([]);
    expect(json.links).toEqual([]);
    expect(json.incomingPointers).toEqual([]);
    expect(json.sequences).toEqual([]);
    expect(json.markup).toEqual({});
    expect(json.contentMarkup).toEqual({});
    expect(json.rules).toEqual({
      markup: [],
      metaEndowments: []
    });
  });

  it('returns a serialized zettel for each zettel in the Edl', () => {
    let dv = DocuverseBuilder().add(obj => ({
      edl: obj.anEdl().withClips(obj.aSpan(), obj.aSpan(), obj.aSpan()),
      dmb: obj.aDocModelBuilder(obj.edl)
    })).build();

    let json = DocumentModelSerializer(dv.dmb.build()).serialize();

    expect(json.zettel).toHaveLength(3);
  });

  it('returns a serialized link for each link in the Edl', () => {
    let dv = DocuverseBuilder().add(obj => ({
      edl: obj.anEdl().withLinks(obj.aLink(), obj.aLink(), obj.aLink()),
      dmb: obj.aDocModelBuilder(obj.edl)
    })).build();

    let json = DocumentModelSerializer(dv.dmb.build()).serialize();

    expect(json.links).toHaveLength(3);
  });

  it('populates a serialized zettel correctly', () => {
    let dv = DocuverseBuilder().add(obj => ({
      span: obj.aSpan(),
      edl: obj.anEdl().withClip(obj.span),
      dmb: obj.aDocModelBuilder(obj.edl)
    })).build();

    let json = DocumentModelSerializer(dv.dmb.build()).serialize();
    let zettel = json.zettel[0];

    expect(zettel.pointer).toEqual(dv.span);
  });

  it('populates a serialized link correctly', () => {
    let dv = DocuverseBuilder().add(obj => ({
      span: obj.aSpan(),
      link: obj.aLink().withEnd(["foo", [obj.span]]),
      edl: obj.anEdl().withLink(obj.link),
      dmb: obj.aDocModelBuilder(obj.edl)
    })).build();

    let json = DocumentModelSerializer(dv.dmb.build()).serialize();
    let link = json.links[0];

    expect(link.ends).toHaveLength(1);
    expect(link.ends[0].name).toBe("foo");
    expect(link.ends[0].pointers).toHaveLength(1);
    expect(link.ends[0].pointers[0]).toEqual(dv.span);
  });
});
