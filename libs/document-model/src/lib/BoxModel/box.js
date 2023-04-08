export function Box(originObject, members) {
  if (originObject === undefined && members.length === 0) {
    throw "Empty boxes are forbidden.";
  }

  return {
    isBox: true,
    originObject,
    members,
    key: "b" + (originObject ? originObject.key : members[0].key)
  };
}
