import { addMethods, addProperties } from "@commonplace/utils";

export default function TypeBuilder(type) {
  const obj = {
    type,
    typeLink: undefined,
    hasType: false,
    hasStringType: false,
    hasPointerType: false,
    outstanding: [],
    outstandingAddedCallback: undefined,
    outstandingCancelledCallback: undefined,
  };

  addProperties(obj, {
    builderType: "type"
  });

  function updateOutstanding()
  {
    const previous = obj.outstanding;
    obj.outstanding = [];

    if (obj.hasPointerType && !obj.typeLink)
    {
        obj.outstanding.push(obj.type);
    }

    const newOutstanding = obj.outstanding.filter(pointer => !previous.find(p => p.denotesSame(pointer)));
    if (obj.outstandingAddedCallback) { obj.outstandingAddedCallback(newOutstanding); }
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
    resolve: values => {
      values.forEach(({pointer, object}) => {
        if (!obj.typeLink && pointer.denotesSame(obj.type)) {
          obj.typeLink = object;
          updateOutstanding();
        }
      });

    },
    attachToOutstanding: (addedCallback, cancelledCallback) => {
      obj.outstandingAddedCallback = addedCallback;
      obj.outstandingCancelledCallback = cancelledCallback;
    }
  });

  obj.setType(type);

  return obj;
}
