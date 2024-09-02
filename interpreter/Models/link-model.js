import { addMethods, addProperties } from "@commonplace/utils";
import EndModel from "./end-model";
import TypeModel from "./type-model";

export default function LinkModel(depth, index) {
  const obj = {
    type: TypeModel(),
    depth,
    index
  };

  addProperties(obj, {
    modelType: "link",
    ends: [],
    outstanding: []
  });

  return addMethods(obj, {
    setType: type => {
      obj.type.setType(type);
    },
    appendEnd: (name, pointers) => {
      const end = EndModel(name, pointers);
      obj.ends.push(end);
      return end;
    },
    removeEnd: index => {
      ends.splice(index, 1);
    },
    setPriority: (depth, index) => {
      obj.depth = depth;
      obj.index = index;
    }
  });
}
