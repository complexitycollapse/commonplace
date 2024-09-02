import { addMethods, addProperties, ListMap } from "@commonplace/utils";

export default function TypeModel(type) {
  const obj = {
    type,
    typeLink: undefined,
    hasType: false,
    hasStringType: false,
    hasPointerType: false,
    outstanding: []
  };

  addProperties(obj, {
    modelType: "type",
    hooks: ListMap()
  });

  function updateOutstanding()
  {
    const previous = obj.outstanding;
    obj.outstanding = [];

    if (obj.type)
    {
      if (obj.hasPointerType && obj.typeLink === undefined) {
        obj.outstanding.push(obj.type);
      }
    }

    const newOutstanding = obj.outstanding.filter(pointer => !previous.find(p => p.denotesSame(pointer)));
    callHook("resolution requested", { pointers: newOutstanding });
  }

  function callHook(type, event) {
    const hooks = obj.hooks.get(type);
    hooks.forEach(hook => {
      try {
        hook(type, event);
      }
      catch {

      }
    });
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
      updateOutstanding();
    },
    resolve: (pointer, value) => {
      let typeResolved;
      if (pointer.denotesSame(type)) {
        obj.typeLink = value;
        typeResolved = true;
      }

      updateOutstanding();
      if (typeResolved)
      {
        callHook("resolved", { pointer, value, requirement: "type" });
      }
    },
    addHook: (type, handler) => {
      obj.hooks.push(type, handler);
    }
  });

  obj.setType(type);

  return obj;
}
