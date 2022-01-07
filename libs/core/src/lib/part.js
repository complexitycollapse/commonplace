import { addProperties, finalObject } from './utils';

export function Part(clip, content) {
  let obj = {};

  function clone(props = {}) {
    return Part(
      "clip" in props ? props.clip : clip,
      "content" in props ? props.content : content);
  }

  function intersect(otherClip) {
    let intersection = clip.intersect(otherClip);
    if (intersection[0]) { return Part(intersection[1], content); }
    else { return undefined; }
  }

  addProperties(obj, {
    content,
    clip
  });

  return finalObject(obj, {
    intersect,
    clone
  });
}
