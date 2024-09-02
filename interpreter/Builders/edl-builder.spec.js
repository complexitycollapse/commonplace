import { describe, it, expect } from 'vitest';
import Interpreter from '../interpreter';
import { Span } from '@commonplace/core';

describe("EdlBuilder", () => {
  describe("appendClip", () => {
    it('adds the clips to an empty edl and creates a corresponding Zettel', () => {
      const builder = Interpreter().create().edl();

      builder.appendClip(Span("ori", 1, 10));

      expect(builder.clips).toEqual([Span("ori", 1, 10)]);
      expect(builder.zettel).toMatchObject([{ clip: Span("ori", 1, 10) }]);
    });

    it('adds an EdlBuilder to clips and zettel', () => {
      const i = Interpreter();
      const builder = i.create().edl();
      const child = i.create().edl();

      builder.appendClip(child);

      expect(builder.clips).toEqual([child]);
      expect(builder.zettel).toEqual([child]);
    });

    it('appends a clip if it does not abut the previous one', () => {
      const builder = Interpreter().create().edl();

      builder.appendClip(Span("ori", 1, 10));
      builder.appendClip(Span("ori", 12, 10));

      expect(builder.clips).toEqual([Span("ori", 1, 10), Span("ori", 12, 10)]);
      expect(builder.zettel).toMatchObject([{ clip: Span("ori", 1, 10) }, { clip: Span("ori", 12, 10) }]);
    });

    it('merges a clip if it abuts the previous one', () => {
      const builder = Interpreter().create().edl();

      builder.appendClip(Span("ori", 1, 10));
      builder.appendClip(Span("ori", 11, 10));

      expect(builder.clips).toEqual([Span("ori", 1, 20)]);
      expect(builder.zettel).toMatchObject([{ clip: Span("ori", 1, 20) }]);
    });
  });
});
