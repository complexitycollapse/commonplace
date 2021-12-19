import { addMethods, addProperties } from "@commonplace/core";

export function Fragment(clip, endset, renderLink) {
  let obj = {
    children: []
  };

  addProperties(obj, {
    clip,
    endset,
    renderLink
  });

  function tryAdd(frag) {
    let engulfResult = engulfs(frag.clip);

    if (engulfResult === "engulfs") {
      return tryAddNewDescendent(frag);
    }
    else {
      return engulfResult;
    }
  }

  function engulfs(otherClip) {
    if (!clip) { return "engulfs"; }
    if (!otherClip) { return "engulfedBy"; }
    if (clip.engulfs(otherClip)) { return "engulfs" }
    if (otherClip.engulfs(clip)) { return "engulfedBy" }
    if (clip.overlaps(otherClip)) { return "overlapping"; }
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
