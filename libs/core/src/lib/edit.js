import { EditIterator } from "./edit-iterator";
import { addProperties, addMethods } from "./utils";
import { Pointer } from "./pointer";

export function Edit(editType, origin) {
  let obj = Pointer("edit", true);

  addProperties(obj, {
    editType,
    origin
  });

  addMethods(obj, {
    equalOrigin: edit => edit.origin == origin,
    editSource: () => EditIterator(x => x, [obj])
  });

  return obj;
}
