import { addProperties, addMethods } from "../utils";

export function Pointer(pointerType, isClip, originFn, partBuilder, hashableNameFn, properties, methods) {
  let obj = {};
  addProperties(obj, { pointerType, isClip });
  addProperties(obj, properties);
  addMethods(obj, { 
    partBuilder,
    hasSamePointerType: pointer => pointer.pointerType === pointerType
  });
  addMethods(obj, methods);
  let origin = originFn(obj);
  let hashableName = hashableNameFn(obj);
  addProperties(obj, { origin, hashableName });
  return obj;
}
