import { finalObject } from "@commonplace/utils";

export function SequentialPartFetcher(...fetchers) {

  async function getPart(pointer) {
    let lastResult = [false, "No fetchers"];

    for (let fetcher of fetchers) {
      lastResult = await fetcher.getPart(pointer);
      if (lastResult[0]) { return lastResult; }
    }

    return lastResult;
  }

  return finalObject({}, { getPart });
}
