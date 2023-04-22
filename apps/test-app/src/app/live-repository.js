import { PartRepository } from "@commonplace/core";
import { DefaultsPartFetcher } from "@commonplace/document-model";
import { SequentialPartFetcher, StaticPartFetcher } from "@commonplace/html";

export default function liveRepository() {
  let fetcher = SequentialPartFetcher(
  DefaultsPartFetcher(),
  StaticPartFetcher("/content/", fetch));

  let repository = PartRepository(fetcher);

  return repository;
}
