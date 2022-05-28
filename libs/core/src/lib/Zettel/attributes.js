import { finalObject } from "../utils";
import { ContentAttributeSource, DefaultsAttributeSource, DirectAttributeSource } from "./attributes-source";

export function Attributes(owner, parent, pointerStack, defaultsStack) {
  let obj = {};
  let materializedPointerStack = undefined;

  function pointerList() {
    if (!materializedPointerStack) {
      materializedPointerStack = [...pointerStack];
    }
    return materializedPointerStack;
  }

  function content() {
    let ourContentSource = ContentAttributeSource(owner, pointerList());
    return [ourContentSource, (parent ? parent.content() : [])];
  }

  function values() {
    let attributes = new Map();
  
    function collapse(source) {
      if (Array.isArray(source)) {
        source.forEach(collapse);  
      } else if (source.attributes) {
        collapse(source.attributes().contents);
      } else if (source.attribute && !attributes.has(source.attribute)) {
        attributes.set(source.attribute, source.value);
      }
    }
  
    let directSource = DirectAttributeSource(owner, pointerList());
    let contentSource = content();
    let defaultsSource = DefaultsAttributeSource(defaultsStack);
    collapse([directSource, contentSource, defaultsSource]);
    return attributes;
  }

  return finalObject(obj, {
    content,
    values
  });
}

export let attributeTesting = {
  hasAttribute(values, attribute, expectedValue) {
    if (!values.has(attribute)) {
      return {
        pass: false,
        message: () => `expected attribute ${attribute} was not found`
      };
    }
  
    if (values.get(attribute) !== expectedValue) {
      return {
        pass: false,
        message: () => `expected attribute ${attribute} to have value ${expectedValue}, actually ${values.get(attribute)}`
      };
     } else {
      return {
      pass: true,
        message: () => `expected attribute ${attribute} to have value different from ${expectedValue}`
      };
    }
  },
  
  hasExactlyAttributes(values, ...attributeValuePairs) {
    let keys = [...values.keys()];
    for (let i = 0; i < attributeValuePairs.length; i += 2) {
      let present = attributeTesting.hasAttribute(values, attributeValuePairs[i], attributeValuePairs[i+1]);
      if (!present.pass) {
        return present;
      }
      keys = keys.filter(x => x !== attributeValuePairs[i]);
    }
  
    if (keys.length == 0) {
      return {
        pass: true,
        message: () => "Expected additional keys"
      };
    } else {
      return {
        pass: false,
        message: () => `Unexpected keys: ${JSON.stringify(keys)}`
      };
    }
  }
};
