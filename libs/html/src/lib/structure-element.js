import { addMethods, addProperties } from "@commonplace/core";

export function StructureElement(endsets) {
  let obj = {};
  
  addProperties(obj, {
    endsets,
    structuralEndsets: endsets.filter(e => e.link.isStructural)
  });

  function pickEndsets(onlyStructural) {
    return onlyStructural ? obj.structuralEndsets : endsets;
  }

  function endsetsNotInOther(other, onlyStructural) {
    let openings = [];
    let objEndsets = obj.pickEndsets(onlyStructural);
  
    objEndsets.forEach(ourEndset => {
      if (!other.hasModifiedEndset(ourEndset, onlyStructural)) {
        openings.push(ourEndset);
      }
    });
  
    return openings;
  }
  
  function sharedEndsets(other, onlyStructural) {
    let common = [];
    let objEndsets = obj.pickEndsets(onlyStructural);
  
    objEndsets.forEach(ourEndset => {
      if (other.hasModifiedEndset(ourEndset, onlyStructural)) {
        common.push(ourEndset);
      }
    });
  
    return common;
  }

  function sameEndsets(other, onlyStructural) {
    let otherEndsets = other.pickEndsets(onlyStructural);
    let length = obj.pickEndsets(onlyStructural).length;
    return otherEndsets.length === length && obj.sharedEndsets(other, onlyStructural).length === length;
  }
  
  function hasModifiedEndset(endset, onlyStructural) {
    let objEndsets = obj.pickEndsets(onlyStructural);
    return objEndsets.find(ours => 
      endset.link === ours.link && endset.index === ours.index);
  }

  addMethods(obj, {
    hasModifiedEndset,
    endsetsNotInOther,
    sharedEndsets,
    sameEndsets,
    pickEndsets
  });

  return obj;
}