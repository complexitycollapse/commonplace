import { finalObject } from "@commonplace/utils";
import { serializeEdl, serializeLink } from "./common-serializers.js";

export function DocumentModelSerializer(docModel) {
  function serialize() {
    let serialized = serializeEdl(docModel);
    serialized.defaults = Object.values(docModel.defaultsLinks).map(serializeLink);
    return serialized;
  }

  return finalObject({}, { serialize });
}
