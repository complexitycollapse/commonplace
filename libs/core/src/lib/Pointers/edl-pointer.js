import { leafDataToEdl } from "../model";
import { Part } from "../part";
import { Pointer } from "./pointer";

export function EdlPointer(edlName) {
  let obj = Pointer(
    "edl",
    false,
    x => x.edlName,
    async response => Part(obj, leafDataToEdl(await response.json())),
    { edlName }, {
    leafData() { return { typ: "edl", name: edlName }; },
    clipPart (part){
      return obj.hasSamePointerType(part.pointer) && edlName === part.pointer.edlName 
        ? [true, part] 
        : [false, undefined];
    }
  });

  return obj;
}

export let emptyDocPointer = EdlPointer("empty.json");

export function leafDataToEdlPointer(data) {
  return EdlPointer(data.name);
}
