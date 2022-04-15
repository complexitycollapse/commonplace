import { finalObject } from "../utils";
import { ContentAttributeSource } from "./attributes-source";

export function Attributes(owner, parent, renderPointerCollection) {
  let obj = {};

  function content() {
    let ourContentSource = ContentAttributeSource(owner, renderPointerCollection.pointerStack());
    return [ourContentSource, ...(parent ? parent.content() : [])];
  }

  function values(source) {
    let attributes = Map();
  
    function collapse(source) {
      if (Array.isArray(source)) {
        source.forEach(collapse);  
      } else if (source.contents) {
        collapse(source.contents);
      } else if (!attributes.has(source.attribute)) {
        attributes.set(source.attribute, source.value);
      }
    }
  
    collapse(source);
    return attributes;
  }

  return finalObject(obj, {
    content,
    values
  });
}
