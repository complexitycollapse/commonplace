// import { finalObject } from '@commonplace/utils';
// import { compareLinkPriority } from '../link-priority';

// export function BoxModelBuilder(docModel) {

//   // This will return an ORDERED hierarchy of containers (ordered by appearance in the EDL).
//   function getContainerHierarchy(zettel, start) {
//     let childItems = [];

//     for (let i = start; i < zettel.length; ++i) {

//     }
//     zettel.forEach(z => {
//       // Get all the root sequences that begin at this zettel.
//       let startingSequences = z.sequences.filter(s => !s.isSubordinated && s.members[0] === z);
//       let sequenceHierarchies = startingSequences.map(s => [s, getContainerHierarchy(x.members, parentSequences.concat([x]))]);
//       sequenceHierarchies.sort((a, b) => compareLinkPriority(a[0].definingLink, b[0].definingLink));
//       childItems = childItems.concat(sequenceHierarchies);

//       // If the child Edl is not part of a sequence then it is a direct container child.
//       if (z.sequences.filter(s => ).length === 0)
//       if (z.isEdl) {
//         childItems.push([z, getContainerHierarchy(z.zettel)]);
//       }
//     });

//     return childItems;
//   }

//   function isTrue(value) { return value && value !== "false"; }

//   function Box(originObject, members) {
//     return { originObject, members };
//   }

//   function generateContainersFromBoxes(container) {
//     let childContainers =
//   }

//   return finalObject({}, {
//     build: () => {
//       // First need to create a hierarchy of boxes. These can be sequences and
//       // EDLs, including the root EDL. An EDL may be contained directly or be
//       // part of a sequence. This needs to be calculated hierarchically all the
//       // way down.
//       let rootContainer = [docModel, getContainerHierarchy(docModel.zettel)];
//       let rootBox = generateContainersFromBoxes(rootContainer);
//     }
//   });
// }
