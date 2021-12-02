import { addProperties, addMethods } from "./utils";
import { Endset, leafDataToEndset } from "./endsets";
import { Span } from "./spans";

export function Link(type, ...endsets) {
  let obj = {};

  addProperties(obj, {
    type,
    endsets
  });

  function leafData() {
    return {
      typ: type,
      es: endsets.map(e => e.leafData())
    };
  }

  addMethods(obj, {
    leafData
  });

  return obj;
}

export function leafDataToLink(leafData) {
  let es = leafData.es.map(leafDataToEndset);
  return Link(leafData.typ, ...es);
}

export let linkTesting = {
  makeSpanLink({ type = "typeA", editLists } = {}) {
    if (editLists === undefined) {
      editLists = [
        [Span("origin", 0, 10), Span("origin", 20, 15)],
        [Span("origin", 40, 5), Span("origin", 50, 20)]
      ];
    }
  
    let endsets = [], i = 0;
  
    editLists.forEach(ss => {
      endsets.push(Endset("name" + i.toString(), ss));
      i += 1;
    });
  
    return Link(type ?? "typeA", ...endsets);
  }
};
