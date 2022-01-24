import { addProperties, addMethods } from "../utils";

export function Pointer(pointerType, isClip, originMapping, partBuilder, properties, methods) {
  let obj = {};
  addProperties(obj, { pointerType, isClip });
  addProperties(obj, properties);
  addMethods(obj, { 
    partBuilder,
    hasSamePointerType: pointer => pointer.pointerType === pointerType
  });
  addMethods(obj, methods);
  let origin = originMapping(obj);
  addProperties(obj, { origin });
  return obj;
}
