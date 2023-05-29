import { finalObject } from '@commonplace/utils';
import { serializeLink, serializeAtom, serializeEdl, linkName } from './common-serializers';

export function BoxModelSerializer(boxModel) {
  function serialize() {
    return serializeBox(boxModel);
  }

  return finalObject({}, { serialize });
}

function serializeBox(box) {
  return {
    originObject: serializeOrigin(box.originObject),
    key: box.key,
    members: box.members.map(member => member.isBox ? serializeBox(member) : serializeAtom(member))
  };
}

function serializeOrigin(origin) {
  if (origin === undefined) { return "implicit"; }
  if (origin.isSequence) { return `Sequence (${linkName(origin.definingLink)})`; }
  if (origin.isEdl) { return serializeEdl(origin); }
  if (origin.isLink) { return serializeLink(origin); } // Is this valid? Wouldn't it be a sequence?
  return "Unexpected origin type";
}
