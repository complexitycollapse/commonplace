import { addMethods, addProperties } from "@commonplace/utils";
import LinkModel from "./link-model";

export default function EdlModel(depth, edl) {
  const obj = {
    modified: !edl,
    edl,
    depth
  };

  addProperties(obj, {
    modelType: "edl",
    clips: [],
    links: [],
    unresolved: []
  });

  addMethods(obj, {
    appendLink: () => {
      const linkModel = LinkModel(obj.depth, obj.links.length);
      links.push(linkModel);
      return linkModel;
    }
  });

  return obj;
}
