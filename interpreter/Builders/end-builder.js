import { addMethods } from "@commonplace/utils";

export default function EndBuilder(name, pointers = []) {
  const obj = {
    name,
    pointers: [...pointers],
    value: undefined
  };

  addMethods(obj, {
    setName: name => {
      obj.name = name;
    },
    setPointers: pointers => {
      obj.pointers = [...pointers];
    },
    setValue: value => {
      obj.value = value;
      obj.pointers = [];
    }
  });

  return obj;
}
