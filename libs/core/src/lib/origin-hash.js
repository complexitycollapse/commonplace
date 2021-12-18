import { addMethods } from "./utils";

export function OriginHash() {
  let obj = {};
  let hash = {};

  function add(origin, value) {
    let list = hash[origin];
    if (list) { list.push(value); }
    else { hash[origin] = [value]; }
    return obj;
  }

  function addEdit(edit) {
    return add(edit.origin, edit);
  }

  function get(origin) {
    return hash[origin] ?? [];
  }

  addMethods(obj, {
    add,
    addEdit,
    get
  });

  return obj;
}
