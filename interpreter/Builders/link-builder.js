import { addMethods, addProperties } from "@commonplace/utils";
import EndBuilder from "./end-builder";
import TypeBuilder from "./type-builder";

export default function LinkBuilder(depth, index) {
  const obj = {
    type: TypeBuilder(),
    depth,
    index
  };

  addProperties(obj, {
    builderType: "link",
    ends: [],
    outstanding: []
  });

  return addMethods(obj, {
    setType: type => {
      obj.type.setType(type);
    },
    appendEnd: (name, pointers) => {
      const end = EndBuilder(name, pointers);
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
