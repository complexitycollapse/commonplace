import { addMethods, addProperties } from "@commonplace/core";

export function StructureElement(endsets) {
  let obj = {};
  
  addProperties(obj, {
    endsets,
  });

  function endsetsNotInOther(other) {
    let openings = [];
  
    obj.endsets.forEach(ourEndset => {
      if (!other.hasModifiedEndset(ourEndset)) {
        openings.push(ourEndset);
      }
    });
  
    return openings;
  }
  
  function sharedEndsets(other) {
    let common = [];
  
    obj.endsets.forEach(ourEndset => {
      if (other.hasModifiedEndset(ourEndset)) {
        common.push(ourEndset);
      }
    });
  
    return common;
  }

  function sameEndsets(other) {
    let length = obj.endsets.length;
    return other.endsets.length === length && obj.sharedEndsets(other).length === length;
  }
  
  function hasModifiedEndset(endset) {
    return obj.endsets.find(ours => 
      endset.link === ours.link && endset.index === ours.index);
  }

  addMethods(obj, {
    hasModifiedEndset,
    endsetsNotInOther,
    sharedEndsets,
    sameEndsets
  });

  return obj;
}