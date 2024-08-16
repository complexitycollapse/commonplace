export function Box(originObject, members, markup, isRootBox) {
  if (originObject === undefined && members.length === 0) {
    throw "Empty boxes are forbidden.";
  }

  return {
    isBox: true,
    isRootBox,
    originObject,
    members,
    key: "b" + (originObject ? originObject.key : members[0].key),
    markup
  };
}
