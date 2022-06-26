import { addProperties, addMethods } from "@commonplace/utils";

export function Pointer(pointerType, isClip, specifiesContent, originFn, partBuilder, hashableNameFn, properties, methods) {
  let obj = {};

  addProperties(obj, {
    pointerType,
    isClip,
    specifiesContent
  });

  addProperties(obj, properties);

  function denotesSame(otherPointer) {
    if (pointerType !== otherPointer.pointerType) {
      return false;
    }

    let propsLeaf = obj.leafData();
    let otherPropsLeaf = otherPointer.leafData();

    return Object.entries(propsLeaf).every(e => e[0] === "ctx" || otherPropsLeaf[e[0]] == e[1]);
  }

  addMethods(obj, { 
    partBuilder,
    hasSamePointerType: pointer => pointer.pointerType === pointerType,
    denotesSame
  });
  addMethods(obj, methods);
  let origin = originFn(obj);
  let hashableName = hashableNameFn(obj);
  addProperties(obj, { origin, hashableName });
  return obj;
}
