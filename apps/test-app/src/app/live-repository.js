import { PartRepository, SequentialPartFetcher } from "@commonplace/core";
import { DefaultsPartFetcher, WellKnownObjectsPartFetcher } from "@commonplace/document-model";
import { StaticPartFetcher } from "@commonplace/html";

export default function liveRepository() {
  let fetcher = SequentialPartFetcher(
    WellKnownObjectsPartFetcher(),
    DefaultsPartFetcher(),
    StaticPartFetcher("/content/", fetch));

  let repository = PartRepository(fetcher);

  return repository;
}
