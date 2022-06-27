import { finalObject } from "@commonplace/utils";

export function Pouncer(repository) {
  let obj = {};

  async function fetchDoc(edlZettel) {
    for(let requests = edlZettel.outstandingRequests(); requests.length > 0; requests = edlZettel.outstandingRequests()) {
      await repository.getManyParts(requests);
    }

    return edlZettel;
  }

  return finalObject(obj, {
    fetchDoc
  });
}
