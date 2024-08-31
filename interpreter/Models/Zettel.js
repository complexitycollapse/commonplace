import { addMethods } from "@commonplace/utils";

export default function Zettel(clip) {
  const obj = {
    clip,
    incommingPointers: []
  };

  addMethods(obj, {
    updateClip: clip => {
      obj.clip = clip;
    }
  });

  return obj;
}
