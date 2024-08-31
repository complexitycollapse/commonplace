import { addMethods } from "@commonplace/utils";

export default function EndModel(name, pointers) {
  const obj = {
    name,
    pointers: [...pointers]
  };

  addMethods(obj, {
    setName: name => {
      obj.name = name;
    },
    setPointers: pointers => {
      obj.pointers = [...pointers];
    }
  });

  return obj;
}
