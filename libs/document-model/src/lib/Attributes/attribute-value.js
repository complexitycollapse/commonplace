import { addProperties } from "@commonplace/utils";

export function AttributeValue(attributeName, attributeValue, endowingPointer, endowmentType, isDefault) {
  let obj = {}

  addProperties(obj, {
    attributeName,
    attributeValue,
    endowingPointer,
    endowmentType,
    isDefault
  });

  return obj;
}
