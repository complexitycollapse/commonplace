import { addProperties, finalObject, memoize } from "@commonplace/utils";
import { ContentAttributeSource, DirectAttributeSource } from "./attributes-source";

export function Attributes(owner, parent, pointerStack, defaultsStack) {
  let obj = {};

  function content() {
    let ourContentSource = ContentAttributeSource(owner, pointerStack);
    return [ourContentSource, (parent ? parent.content() : [])];
  }

  function defaultContent() {
    let ourDefaultContentSource = ContentAttributeSource("defaults", defaultsStack);
    return [ourDefaultContentSource, (parent ? parent.defaultContent() : [])];
  }

  function values() {
    let attributes = new Map();
  
    function collapse(source) {
      if (Array.isArray(source)) {
        source.forEach(collapse);  
      } else if (source.attributes) {
        collapse(source.attributes.contents);
      } else if (source.attribute && !attributes.has(source.attribute)) {
        attributes.set(source.attribute, source.value);
      }
    }
  
    let directSource = DirectAttributeSource(owner, pointerStack);
    let contentSource = content();
    let directDefaultsSource = DirectAttributeSource("defaults", defaultsStack);
    let contentDefaultsSource = defaultContent();
    collapse([directSource, contentSource, directDefaultsSource, contentDefaultsSource]);
    return attributes;
  }

  addProperties(obj, {
    values: memoize(values)
  });

  return finalObject(obj, {
    content,
    defaultContent
  });
}

export let attributesTesting = {
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
      let present = attributesTesting.hasAttribute(values, attributeValuePairs[i], attributeValuePairs[i+1]);
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
