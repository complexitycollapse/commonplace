import jsonParse from "../json-parse.js";
import { leafDataToEdl } from "../model.js";
import { Part } from "../part.js";
import { Pointer } from "./pointer.js";

export function EdlPointer(edlName) {
  function engulfs(obj, other) {
    return obj.sameType(other) && edlName === other.edlName;
  }

  let obj = Pointer(
    "edl",
    false,
    false,
    x => x.edlName,
    async response => Part(obj, leafDataToEdl(await jsonParse(response, origin))),
    () => `edl:${edlName}`,
    { edlName },
    {
      leafData() { return { typ: "edl", name: edlName }; },
      clipPart(part) {
        let pointer = part.pointer;
        if (pointer.engulfs(obj)) {
          return [true, part];
        } else {
        return false;
        }
      },
      engulfs: other => engulfs(obj, other),
      endowsTo: other => engulfs(obj, other),
      nibble: other => ({ nibbled: engulfs(obj, other), remainder: undefined })
  });

  return obj;
}

export let emptyDocPointer = EdlPointer("empty.json");

export function leafDataToEdlPointer(data) {
  return EdlPointer(data.name);
}
