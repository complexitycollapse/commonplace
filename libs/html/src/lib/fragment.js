import { addMethods, addProperties } from "@commonplace/core";

export function Fragment(edit, endset, renderLink) {
  let obj = {
    children: []
  };

  addProperties(obj, {
    edit,
    endset,
    renderLink
  });

  function tryAdd(frag) {
    let engulfResult = engulfs(frag.edit);

    if (engulfResult === "engulfs") {
      return tryAddNewDescendent(frag);
    }
    else {
      return engulfResult;
    }
  }

  function engulfs(otherEdit) {
    if (!edit) { return "engulfs"; }
    if (!otherEdit) { return "engulfedBy"; }
    if (edit.engulfs(otherEdit)) { return "engulfs" }
    if (otherEdit.engulfs(edit)) { return "engulfedBy" }
    if (edit.overlaps(otherEdit)) { return "overlapping"; }
    return "separate";
  }

  function tryAddNewDescendent(newChild) {
    let grandchildResult = tryAddGrandchild(newChild);

    if (grandchildResult === "overlapping") {
      return "overlapping";
    }

    if (grandchildResult === "interposing") {
      addInterposingChild(newChild);
    } else if (grandchildResult === "notGrandchild") {
      addImmediateChild(newChild);
    }

    return "engulfs";
  }

  function tryAddGrandchild(possibleGrandchild) {
    let interposing = false;

    for(let existingChild of obj.children) {
      let addResult = existingChild.tryAdd(possibleGrandchild);
      
      if (addResult === "engulfs") {
        return "addedGrandchild";
      }
      
      if (addResult === "overlapping") {
        return "overlapping";
      }

      if (addResult === "engulfedBy") {
        interposing = true;
      }
    }

    return interposing ? "interposing" : "notGrandchild";
  }

  function addImmediateChild(newChild) {
    obj.children.push(newChild);
  }

  function addInterposingChild(newChild) {
    let backup = [...obj.children];
    obj.children.splice(0, obj.children.length);
    obj.children.push(newChild);
    backup.forEach(tryAdd);
  }

  addMethods(obj, {
    tryAdd
  });

  return obj;
}

export function RootFragment() {
  return Fragment(undefined, undefined, undefined);
}
