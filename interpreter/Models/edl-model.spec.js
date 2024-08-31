import { describe, it, expect } from 'vitest';
import Interpreter from '../interpreter';
import { Span } from '@commonplace/core';

describe("EdlModel", () => {
  describe("appendClip", () => {
    it('adds the clips to an empty edl and creates a corresponding Zettel', () => {
      const model = Interpreter().create().edl();

      model.appendClip(Span("ori", 1, 10));

      expect(model.clips).toEqual([Span("ori", 1, 10)]);
      expect(model.zettel).toMatchObject([{ clip: Span("ori", 1, 10) }]);
    });

    it('adds an EdlModel to clips and zettel', () => {
      const i = Interpreter();
      const model = i.create().edl();
      const child = i.create().edl();

      model.appendClip(child);

      expect(model.clips).toEqual([child]);
      expect(model.zettel).toEqual([child]);
    });

    it('appends a clip if it does not abut the previous one', () => {
      const model = Interpreter().create().edl();

      model.appendClip(Span("ori", 1, 10));
      model.appendClip(Span("ori", 12, 10));

      expect(model.clips).toEqual([Span("ori", 1, 10), Span("ori", 12, 10)]);
      expect(model.zettel).toMatchObject([{ clip: Span("ori", 1, 10) }, { clip: Span("ori", 12, 10) }]);
    });

    it('merges a clip if it abuts the previous one', () => {
      const model = Interpreter().create().edl();

      model.appendClip(Span("ori", 1, 10));
      model.appendClip(Span("ori", 11, 10));

      expect(model.clips).toEqual([Span("ori", 1, 20)]);
      expect(model.zettel).toMatchObject([{ clip: Span("ori", 1, 20) }]);
    });
  });
});
