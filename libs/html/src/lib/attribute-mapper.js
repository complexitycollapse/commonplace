let mappers = new Map();

export function registerMapper(mapper) {
  let attributes = mapper.attributes;
  if (Array.isArray(attributes)) { attributes.forEach(p => mappers.set(p, mapper)); }
  else mappers.set(attributes, mapper);
}

export const getMapper = (attribute) => mappers.get(attribute);

export function StyleMapper(attributes, cssProperty, cssValue) {
  return {
    attributes,
    properties: () => {
      return [cssProperty];
    },
    styles: (property, value, existingValue) => {
      if (!value) {
        return [];
      }

      let newValue = cssValue ?? value;
      if (existingValue) { newValue = existingValue + " " + newValue };
      return [newValue]
    },
    fragment: false
  };
}

export function FragmentMapper(attributes, fragmentTag) {
  return {
    attributes,
    properties: () => [],
    styles: () => [],
    fragment: true,
    fragmentTag: () => fragmentTag
  };
}
