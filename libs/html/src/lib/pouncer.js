import { finalObject, EdlZettel } from "@commonplace/core";

export function Pouncer(repository) {
  let obj = {};

  async function fetchDoc(docPointer) {
    let edlZettel = EdlZettel(docPointer, undefined, "1");
    for(let requests = edlZettel.outstandingRequests(); requests.length > 0; requests = edlZettel.outstandingRequests()) {
      await repository.getManyParts(requests);
    }

    return edlZettel;
  }

  return finalObject(obj, {
    fetchDoc
  });
}
