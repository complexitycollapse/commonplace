import { leafDataToEdl } from "../model";
import { Part } from "../part";
import { Pointer } from "./pointer";

export function EdlPointer(edlName, index) {
  let obj = Pointer(
    "edl",
    false,
    x => x.edlName,
    async response => Part(obj, leafDataToEdl(await response.json())),
    { edlName, index }, 
    {
      leafData() { return { typ: "edl", name: edlName, idx: index }; },
      hashableName() { return edlName + "/" + (index === undefined ? "N" : index.toString()); },
      clipPart(part) { 
        let pointer = part.pointer;
        if (pointer.engulfs(obj)) {
          if (pointer.index === undefined && index !== undefined) {
            return [true, Part(obj, part.content[index])];
          } else {
            return [true, part];
          } 
        } else {
        return false;
        }
      },
      engulfs(other) {
        // If we don't have an index but other does then we may still match as we
        // may represent the array that contains other.

        if (obj.hasSamePointerType(other) && edlName === other.edlName) {
          let indexMatches = index === undefined || index === other.index;
          return indexMatches;
        }

        return false;
      }
  });

  return obj;
}

export let emptyDocPointer = EdlPointer("empty.json");

export function leafDataToEdlPointer(data) {
  return EdlPointer(data.name, data["idx"]);
}
