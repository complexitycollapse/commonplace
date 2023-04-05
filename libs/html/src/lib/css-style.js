import { finalObject } from "@commonplace/utils";
import { getMapper } from "./attribute-mapper";
import { registerAllMappers } from "./attribute-mappers";

registerAllMappers();

export function CssStyle(markup) {
  let styles = new Map(), fragmentTags = [];

  function calculate() {
    for(let [key, value] of markup.entries()) {
      let mapper = getMapper(key);
      if (!mapper) { continue; }

      let properties = mapper.properties();
      let newValues = properties.map(p => [p, mapper.styles(p, value, styles.get(p))]);
      newValues.forEach(([prop, vals]) => vals.forEach(val => styles.set(prop, val)));

      if (mapper.fragment) {
        fragmentTags.push(mapper.fragmentTag());
      }
    };
  }

  calculate();

  return finalObject({}, {
    css: () => Object.fromEntries(styles),
    fragmentTags: () => fragmentTags
  });
}
