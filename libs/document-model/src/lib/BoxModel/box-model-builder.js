import { finalObject } from '@commonplace/utils';
import { compareLinkPriority } from '../link-priority';

export function BoxModelBuilder(docModel) {

  function isTrue(value) { return value && value !== "false"; }

  function Box(originObject, members) {
    return { originObject, members };
  }

  // This will return an ORDERED hierarchy of containers (ordered by appearance in the EDL).
  function getContainerHierarchy(zettel) {
    let childItems = [];
    let currentNakedItems = undefined;
    let currentSequence = undefined;

    // TODO: how are zettel with the box property handled? Zettel are not the same as clips.
    zettel.forEach(z => {
      if (!z.sequences.contains(currentSequence)) {
        currentSequence = undefined;

        // Begin processing the next box sequence, if any.
        let startingSequences = z.sequences.filter(s => !s.isSubordinated && s.members[0] === z
          && isTrue(docModel.definingLink.markup.get("box")));
        if (startingSequences.length > 0) {
          startingSequences.sort((a, b) => compareLinkPriority(a[0].definingLink, b[0].definingLink));
          if (currentNakedItems) {
            childItems.push(currentNakedItems);
            currentNakedItems = undefined;
          }
          currentSequence = startingSequences[0];
          // Sequences need to be processed recursively by a different fn that expands their non-box members
          childItems.push(currentSequence);
        }

        // If the child is not part of the current sequence then it is a direct container child.
        if (currentSequence === undefined) {
          if (currentNakedItems === undefined) { currentNakedItems = []; }
          // If it is and EDL that's not a box then it needs to be expanded
          currentNakedItems.push(z);
        }
      }

      if (currentNakedItems) {
        childItems.push(currentNakedItems);
      }
    });

    return childItems;
  }

  return finalObject({}, {
    build: () => {
      // First need to create a hierarchy of boxes. These can be sequences and
      // EDLs, including the root EDL. An EDL may be contained directly or be
      // part of a sequence. This needs to be calculated hierarchically all the
      // way down.
      let rootContainer = [docModel, getContainerHierarchy(docModel.zettel)];
    }
  });
}
