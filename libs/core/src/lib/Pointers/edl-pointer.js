import { leafDataToEdl } from "../model";
import { Part } from "../part";
import { Pointer } from "./pointer";

export function EdlPointer(edlName) {
  function engulfs(obj, other) {
    return obj.hasSamePointerType(other) && edlName === other.edlName;
  }

  let obj = Pointer(
    "edl",
    false,
    x => x.edlName,
    async response => Part(obj, leafDataToEdl(await response.json())),
    () => `edl:${edlName}`,
    { edlName, isTypePointer: false }, 
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
      overlaps: other => engulfs(obj, other),
      endowsTo: other => engulfs(obj, other)
  });

  return obj;
}

export let emptyDocPointer = EdlPointer("empty.json");

export function leafDataToEdlPointer(data) {
  return EdlPointer(data.name);
}
