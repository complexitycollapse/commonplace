export function convertJsonToNodes(json, label, key, expanded) {
  if (Array.isArray(json)) {
    return {
      key,
      label: label + " ",
      value: "[" + json.length + "]",
      children: json.map((x, i) => convertJsonToNodes(x, getArrayLabel(i, x), i)),
      expanded
    };
  } else if (typeof json === "object") {
    return {
      key,
      label,
      children: Object.entries(json).map(([key, value], i) => convertJsonToNodes(value, key, i)),
      expanded
    };
  } else {
    return {
      key,
      label: label + " : ",
      value: JSON.stringify(json),
      expanded
    };
  }
}

function getArrayLabel(index, json) {
  if (json.name) {
    return json.name;
  } else if (json.pointer) {
    return json.pointer.hashableName;
  } else {
    return index.toString();
  }
}
