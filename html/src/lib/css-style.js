import { finalObject } from "@commonplace/utils";
import { decorators } from "./style-decorators";

export function CssStyle(target) {
  function css() {
    let css = decorators.reduce((css, decorator) => decorator(css, target), new Map());
    return Object.fromEntries(css);
  }

  return finalObject({}, { css });
}
