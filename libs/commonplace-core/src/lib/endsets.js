import { addProperties } from "./utils";

export function endset(name, set) {
  let obj = {};

  addProperties(obj, { name, set });

  return obj;
}
