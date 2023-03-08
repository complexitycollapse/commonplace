import { addProperties } from "@commonplace/utils";

export function AttributeValue(
  attributeName, attributeValue, attributeRoute, isDefault, linkDepth, linkIndex, origin) {
  let obj = {}

  addProperties(obj, {
    attributeName,
    attributeValue,
    attributeRoute,
    isDefault,
    linkDepth,
    linkIndex,
    origin
  });

  return obj;
}
