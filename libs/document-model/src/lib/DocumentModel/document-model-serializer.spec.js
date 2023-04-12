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
});
