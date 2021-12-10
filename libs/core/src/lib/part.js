import { addProperties, addMethods } from './utils';

export function Part(edit, content) {
  let obj = Object.create(edit);

  function clone(props = {}) {
    return Part(edit.clone(props), "content" in props ? props.content : content);
  }

  addProperties(obj, {
    content
  });

  addMethods(obj, {
    clone
  });

  return obj;
}
