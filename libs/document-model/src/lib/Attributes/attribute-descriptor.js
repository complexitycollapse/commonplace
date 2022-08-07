import { addProperties } from "@commonplace/utils";

export function AttributeDescriptor(attributeName, attributeValue, endowingPointer, endowmentType) {
  let obj = {}

  addProperties(obj, {
    attributeName,
    attributeValue,
    endowingPointer,
    endowmentType,
    isDefault: endowingPointer.renderLink.homeEdl.depth < 0
  });

  return obj;
}
