import { EditIterator } from "./edit-iterator";
import { addProperties, addMethods } from "./utils";

export function Edit(editType, origin) {
  let obj = {};

  addProperties(obj, {
    isEdit: true,
    editType,
    origin
  });

  addMethods(obj, {
    equalOrigin: edit => edit.origin == origin,
    editSource: () => EditIterator(x => x, [obj])
  });

  return obj;
}
