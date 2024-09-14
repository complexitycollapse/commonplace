import { addMethods, addProperties } from "@commonplace/utils";
import EndBuilder from "./end-builder";
import TypeBuilder from "./type-builder";

export default function LinkBuilder({ depth, index, pointer } = {}) {
  const obj = {
    pointer,
    link: undefined,
    type: TypeBuilder(),
    depth,
    index,
    outstanding: [],
    outstandingAddedCallback: undefined,
    outstandingCancelledCallback: undefined,
  };

  addProperties(obj, {
    builderType: "link",
    ends: []
  });

  addMethods(obj, {
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
    },
    resolve: values => {
      obj.type.resolve(values);
      values.forEach(({ pointer, object }) => {
        if (obj.pointer && !obj.link && pointer.denotesSame(obj.pointer)) {
          obj.link = object;
          obj.type.setType(object.type);
        }
      });
      updateOutstanding();
    }
  });

  function updateOutstanding() {

    const previous = obj.outstanding;
    obj.outstanding = [];

    if (obj.pointer && !obj.link) {
      obj.outstanding.push(obj.pointer);
    }

    obj.outstanding = obj.outstanding.concat(obj.type.outstanding);

    const newOutstanding = obj.outstanding.filter(pointer => !previous.find(p => p.denotesSame(pointer)));
    if (obj.outstandingAddedCallback)
    {
      obj.outstandingAddedCallback(newOutstanding);
    }
  }

  updateOutstanding();
  return obj;
}
