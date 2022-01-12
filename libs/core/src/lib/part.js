import { addProperties, finalObject } from './utils';

export function Part(pointer, content) {
  let obj = {};

  function clone(props = {}) {
    return Part(
      "pointer" in props ? props.pointer : pointer,
      "content" in props ? props.content : content);
  }

  addProperties(obj, {
    content,
    pointer
  });

  return finalObject(obj, {
    clone
  });
}
