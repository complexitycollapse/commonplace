import { describe, it, expect } from "vitest";
import { Box } from "./box";
import { Zettel } from "../DocumentModel/zettel";
import { Edl, Span } from "@commonplace/core";

describe("box", () => {
  describe("key", () => {
    it('is set to b+key of the originObject if the originObject is defined', () => {
      expect(Box({ key: "foo" }, [Zettel(Span("z", 1, 2), [], Edl([], []), "bar")]).key).toBe("bfoo");
    });

    it('is set to b+key of the first member if the originObject is undefined', () => {
      expect(Box(undefined, [Zettel(Span("z", 1, 2), [], Edl([], []), "bar")]).key).toBe("bbar");
    });
  });
});