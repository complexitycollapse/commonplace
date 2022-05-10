import { finalObject } from "../utils";
import { ContentAttributeSource, DirectAttributeSource } from "./attributes-source";

export function Attributes(owner, parent, pointerStack) {
  let obj = {};

  function content() {
    let ourContentSource = ContentAttributeSource(owner, pointerStack);
    return [ourContentSource, (parent ? parent.content() : [])];
  }

  function values() {
    let attributes = new Map();
  
    function collapse(source) {
      if (Array.isArray(source)) {
        source.forEach(collapse);  
      } else if (source.attributes) {
        collapse(source.attributes().contents);
      } else if (source.attribute && !attributes.has(source.attribute)) {
        attributes.set(source.attribute, source.value);
      }
    }
  
    let directSource = DirectAttributeSource(owner, pointerStack);
    let contentSource = content();
    collapse([directSource, contentSource]);
    return attributes;
  }

  return finalObject(obj, {
    content,
    values
  });
}
