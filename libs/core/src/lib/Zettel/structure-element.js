import { addMethods, addProperties } from "../utils";

export function StructureElement(endsets, properties = {}) {
  let obj = {};
  
  addProperties(obj, {
    endsets,
    structuralEndsets: endsets.filter(e => e.renderLink.isStructural)
  });

  addProperties(obj, properties);

  function pickRenderEndsets(onlyStructural) {
    return onlyStructural ? obj.structuralEndsets : endsets;
  }

  function renderEndsetsNotInOther(other, onlyStructural) {
    if (other === undefined) { return [...obj.endsets]; }

    let openings = [];
    let objEndsets = obj.pickRenderEndsets(onlyStructural);
  
    objEndsets.forEach(ourEndset => {
      if (!other.hasRenderEndset(ourEndset, onlyStructural)) {
        openings.push(ourEndset);
      }
    });
  
    return openings;
  }
  
  function sharedRenderEndsets(other, onlyStructural) {
    let common = [];
    let objEndsets = obj.pickRenderEndsets(onlyStructural);
  
    objEndsets.forEach(ourEndset => {
      if (other.hasRenderEndset(ourEndset, onlyStructural)) {
        common.push(ourEndset);
      }
    });
  
    return common;
  }

  function sameRenderEndsets(other, onlyStructural) {
    let otherEndsets = other.pickRenderEndsets(onlyStructural);
    let length = obj.pickRenderEndsets(onlyStructural).length;
    return otherEndsets.length === length && obj.sharedRenderEndsets(other, onlyStructural).length === length;
  }
  
  function hasRenderEndset(endset, onlyStructural) {
    let objEndsets = obj.pickRenderEndsets(onlyStructural);
    return objEndsets.find(ours => 
      endset.renderLink === ours.renderLink && endset.index === ours.index);
  }

  addMethods(obj, {
    hasRenderEndset,
    renderEndsetsNotInOther,
    sharedRenderEndsets,
    sameRenderEndsets,
    pickRenderEndsets
  });

  return obj;
}