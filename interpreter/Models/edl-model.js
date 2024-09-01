import { addMethods, addProperties } from "@commonplace/utils";
import LinkModel from "./link-model";
import Zettel from "./Zettel";

export default function EdlModel(depth) {
  const obj = {
    depth,
    unresolvedAddedCallback: undefined,
    unresolvedRemovedCallback: undefined,
  };

  addProperties(obj, {
    modelType: "edl",
    clips: [],
    links: [],
    zettel: [],
    unresolved: []
  });

  addMethods(obj, {
    appendLink: () => {
      const linkModel = LinkModel(obj.depth, obj.links.length);
      links.push(linkModel);
      return linkModel;
    },
    appendClip: clip => {
      if (clip.isClip) {
        addClip(clip, obj.clips, obj.zettel);
      } else if (clip.modelType === "edl") {
        obj.clips.push(clip);
        obj.zettel.push(clip);
      }
    },
    attachToUnresolved: (addedCallback, removedCallback) => {
      obj.unresolvedAddedCallback = addedCallback;
      obj.unresolvedRemovedCallback = removedCallback;
    }
  });

  return obj;
}

function addClip(clip, clips, zettel) {
  let mergedClip;
      
  if (clips.length > 0) {
    const lastClip = clips[clips.length - 1];
    if (lastClip.abuts(clip)) {
      mergedClip = lastClip.merge(clip);
      clips[clips.length - 1] = mergedClip;
      zettel[zettel.length - 1].updateClip(mergedClip);
    }
  }

  if (!mergedClip) {
    clips.push(clip);
    zettel.push(Zettel(clip));
  }
}
