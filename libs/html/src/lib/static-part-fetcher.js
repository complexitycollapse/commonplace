import { Box, finalObject, Part, Span } from '@commonplace/core';

export function StaticPartFetcher(origin, fetch) {
  let obj = {};

  async function getPart(pointer) {
    let url = origin + pointer.origin;
    let response = await fetch(url);
    if (response.ok) { 
      let rawObject = await readResponse(pointer, response);
      let parsedObject = pointer.contentParser(rawObject);
      let partPointer = makePartPointer(pointer, parsedObject);
      return Part(partPointer, parsedObject);
    }
    else {
      console.log(`Failed to load ${JSON.stringify(pointer)} from URL "${url}". Status: ${response.status}`);
      return undefined;
    }
  }

  async function readResponse(pointer, response) {
    if (pointer.isClip) {
      if (pointer.clipType === "span") {
        return await response.text();
      } else if (pointer.clipType === "box") {
        return await response.blob();
      } else {
        throw `StaticPartFetcher.getPart did not understand clip type ${pointer.clipType}`;
      }
    } else {
      return await response.json();
    }
  }

  function makePartPointer(originalPointer, parsedObject) {
    if (originalPointer.isClip) {
      return originalPointer.clipType === "span" ?
            Span(originalPointer.origin, 0, parsedObject.length) :
            Box(originalPointer.origin, 0, 0, 10000, 10000);
    } else {
      return originalPointer;
    }
  }

  return finalObject(obj, {
    getPart
  });
}
