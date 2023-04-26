import { PartRepository, SequentialPartFetcher, WellKnownObjectsPartFetcher } from "@commonplace/core";
import { DefaultsPartFetcher } from "@commonplace/document-model";
import { StaticPartFetcher } from "@commonplace/html";

export default function liveRepository() {
  let fetcher = SequentialPartFetcher(
    WellKnownObjectsPartFetcher(),
    DefaultsPartFetcher(),
    StaticPartFetcher("/content/", fetch));

  let repository = PartRepository(fetcher);

  return repository;
}
