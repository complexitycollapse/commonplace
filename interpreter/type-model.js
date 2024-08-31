import { addMethods, addProperties, ListMap } from "@commonplace/utils";

export default function TypeModel(type) {
  const obj = {
    type,
    typeLink: undefined,
    hasType: false,
    hasStringType: false,
    hasPointerType: false,
    unresolved: []
  };

  addProperties(obj, {
    modelType: "type",
    hooks: ListMap()
  });

  function updateUnresolved()
  {
    const previous = obj.unresolved;
    obj.unresolved = [];

    if (obj.type)
    {
      if (obj.hasPointerType && obj.typeLink === undefined) {
        obj.unresolved.push(obj.type);
      }
    }

    const newUnresolved = obj.unresolved.filter(pointer => !previous.find(p => p.denotesSame(pointer)));
    callHook("resolution requested", { pointers: newUnresolved });
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
      updateUnresolved();
    },
    resolve: (pointer, value) => {
      let typeResolved;
      if (pointer.denotesSame(type)) {
        obj.typeLink = value;
        typeResolved = true;
      }

      updateUnresolved();
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
