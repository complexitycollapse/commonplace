import { addMethods, addProperties } from "@commonplace/utils";
import LinkBuilder from "./link-builder";
import Zettel from "./Zettel";

export default function EdlBuilder(depth) {
  const obj = {
    depth,
    outstandingAddedCallback: undefined,
    outstandingRemovedCallback: undefined,
  };

  addProperties(obj, {
    builderType: "edl",
    clips: [],
    links: [],
    zettel: [],
    outstanding: []
  });

  addMethods(obj, {
    appendLink: () => {
      const linkBuilder = LinkBuilder({ depth: obj.depth, index: obj.links.length });
      links.push(linkBuilder);
      return linkBuilder;
    },
    appendClip: clip => {
      if (clip.isClip) {
        addClip(clip, obj.clips, obj.zettel);
      } else if (clip.builderType === "edl") {
        obj.clips.push(clip);
        obj.zettel.push(clip);
      }
    },
    attachToOutstanding: (addedCallback, removedCallback) => {
      obj.outstandingAddedCallback = addedCallback;
      obj.outstandingRemovedCallback = removedCallback;
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
