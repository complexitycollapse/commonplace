import { addMethods } from "@commonplace/utils";

export default function TypeModel(type) {
  const obj = {
    type,
    typeLink: undefined,
    hasType: false,
    hasStringType: false,
    hasPointerType: false,
    unresolved: []
  };

  function updateUnresolved()
  {
    obj.unresolved = [];

    if (obj.type)
    {
      if (obj.hasPointerType && obj.typeLink === undefined) {
        obj.unresolved.push(obj.type);
      }
    }
  }

  addMethods(obj, {
    setType: type => {
      obj.type = type;
      if (type === undefined) {
        obj.hasType = false;
        obj.hasStringType = false;
        obj.hasPointerType = false;
      } else {
        obj.hasType = true;
        if (typeof type === "string") {
          obj.hasStringType = true;
          obj.hasPointerType = false;
        } else if (type?.pointerType === "link") {
          obj.hasStringType = false;
          obj.hasPointerType = true;
        }
      }
      updateUnresolved();
    },
    resolve: (pointer, value) => {
      if (pointer.denotesSame(type)) {
        obj.typeLink = value;
      }

      updateUnresolved();
    }
  });

  obj.setType(type);

  return obj;
}
