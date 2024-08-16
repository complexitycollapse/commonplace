export function compoundingStyleDecorator(markupProperty, cssProperty, cssReplacementValue) {
  function decorate(cssMap, target) {
    if (!target.markup.has(markupProperty)) { return cssMap; }
    let markupValue = target.markup.get(markupProperty);

    // Use the replacement value if set. Else use the value from markup.
    let newCssValue = cssReplacementValue ?? markupValue;

    // Compound onto the existing css value.
    let existingCssValue = cssMap.get(cssProperty);
    let newCssPropertyValue = existingCssValue ? existingCssValue + " " +  newCssValue : newCssValue;
    cssMap.set(cssProperty, newCssPropertyValue);
    return cssMap;
  }

  return decorate;
}
