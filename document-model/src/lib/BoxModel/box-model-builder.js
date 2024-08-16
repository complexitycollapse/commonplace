import { finalObject } from '@commonplace/utils';
import { Box } from './box.js';

/*
  Rules of boxes:
  1. Sequences and Edls will generate boxes if they have the right attribute.
  2. Other sequences and Edls have their content flattened into the containing box.
  3. The box hierarchy follows the sequence and Edl hierarchy, ignoring non-boxes.
  4. If one box sequence overlaps with another box sequence, except in the relation
     of parent to child, then the sequence that starts later will not generate any
     boxes. If they start at the same point then the lower priority sequence will not
     generate any boxes.
  3. A box may contain only boxes or content. If it has a mixture, implicit boxes
     will be generated to contain the content.
  4. An implicit box will always be the largest possible box, bounded either by sibling
     boxes, or the edges of the containing box, or paragraph markers. (TODO)
  4. Implicit boxes do not respect Edl or sequence boundaries, only box and paragraph
     boundaries.
  5. Top-level Edls are always boxes. Flights are always boxes. This rule cannot be
     overridden. They do not necessarily have the box attribute.
*/

export function BoxModelBuilder(docModel) {

  const isTrue = value => value && value !== "false";
  const isBox = item => isTrue(item.markup.get("box")); // TODO: it this the right attribute?

  // This will return an ORDERED hierarchy of boxes (ordered by appearance in the EDL).
  // Edls and sequences that are not boxes will be flattened.
  function convertToBox(originObject, objectChildren, inSequence, isRootBox) {
    let childBoxes = [];
    let currentImplicitBox = [];
    let currentBoxSequence = undefined;

    function terminateImplicitBox() {
      if (currentImplicitBox.length > 0) {
        childBoxes.push(Box(undefined, currentImplicitBox, new Map()));
        currentImplicitBox = [];
      }
    }

    function climbToTopBoxSequence(sequence, lastBox) {
      if (isBox(sequence.definingLink)) { lastBox = sequence; }
      if (!sequence.isSubordinated) { return lastBox; }
      return climbToTopBoxSequence(sequence.parent, lastBox);
    }

    function gatherZettel(zettel, inSequence) {
      // The box attribute is only valid on sequences and Edls. Everything else is ignored.

      zettel.forEach(z => {
        // Skip this zettel if it is part of a sequence we have previously processed.
        // (This will happen if a box sequence was detected and a box formed from its
        // members. We can then drop the remaining zettel in the sequence).
        if (!z.isSequence && z.sequences.map(climbToTopBoxSequence).includes(currentBoxSequence)) { return; }

        // If the above check failed then we are not in a box sequence.
        currentBoxSequence = undefined;

        if (z.isSequence) {
          if (isBox(z.definingLink)) {
            terminateImplicitBox();
            childBoxes.push(convertToBox(z, z.members, true));
          } else {
            gatherZettel(z.members, true);
          }
        } else {

          if (!inSequence) {

            // Check to see if any box sequences begin here. Get the highest in the sequence hierarchy.
            let sequencesThatBeginHere = z.sequences.filter(s => s.members[0].key === z.key);
            let startingSequences = sequencesThatBeginHere
              .map(climbToTopBoxSequence)
              .filter(s => s);

            if (startingSequences.length > 0) {

              terminateImplicitBox();

              // If there are multiple starting sequences here, pick the highest priority
              startingSequences.sort((a, b) => a.definingLink.compareLinkPriority(b.definingLink));
              currentBoxSequence = startingSequences[0];

              // Add the box sequence as a child box
              let sequenceBox = convertToBox(currentBoxSequence, currentBoxSequence.members, true);
              childBoxes.push(sequenceBox);
            }
          }

          // If we didn't find a box sequence...
          if (currentBoxSequence === undefined) {
            if (z.isEdl) {
              if (isBox(z)) {

                terminateImplicitBox();

                // The Edl is a box, so convert it to a child box.
                childBoxes.push(convertToBox(z, z.zettel, false));
              } else {
                // If it's an EDL that's not a box then it needs to be flattened.
                gatherZettel(z.zettel, false);
              }
            } else {
              // It's just content, so add it to an implicit box.
              currentImplicitBox.push(z);
            }
          }
        }
      });
    }

    gatherZettel(objectChildren, inSequence);

    // Finalize any implicit boxes. An implicit box is only required if there were
    // other boxes in the Edl.
    if (currentImplicitBox.length > 0) {
      if (childBoxes.length === 0) { childBoxes = currentImplicitBox; }
      else { terminateImplicitBox(); }
    }

    let markup = originObject.isSequence ? originObject.definingLink.markup : originObject.markup;
    return Box(originObject, childBoxes, markup, isRootBox);
  }

  return finalObject({}, {
    build: () => {
      // First need to create a hierarchy of boxes. These can be sequences or
      // EDLs, including the root Edl. An Edl may be contained directly or be
      // part of a sequence. This needs to be calculated hierarchically all the
      // way down.
      let rootBox = convertToBox(docModel, docModel.zettel, false, true);
      return rootBox;
    }
  });
}
