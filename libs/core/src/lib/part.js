import { addProperties, finalObject } from './utils';

export function Part(clip, content) {
  let obj = Object.create(clip);

  function clone(props = {}) {
    return Part(clip.clone(props), "content" in props ? props.content : content);
  }

  function intersectingContent(otherClip) {
    return clip.intersectingContent(otherClip, content);
  }

  addProperties(obj, {
    content
  });

  return finalObject(obj, {
    clone,
    intersectingContent
  });
}
