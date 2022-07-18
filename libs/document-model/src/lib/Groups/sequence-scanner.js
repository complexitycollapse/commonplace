import { finalObject } from "@commonplace/utils";
import { SequenceBuilder } from "./sequence-builder";

export function SequenceScanner(edlZettel) {
  let obj = {};

  function makeAllBuilders() {
    let allSequenceDetails = edlZettel.renderLinks.map(l => l.renderEnds.map(e => l.sequenceDetailsEndowments(e)).flat()).flat();
    let builders = allSequenceDetails.map(SequenceBuilder);
    return builders;
  }

  function getBuildersWithSatisfiedDependencies(builders, linksWithSequences) {
    let satisfied = builders.filter(b => b.areDependenciesSatisfied(linksWithSequences));
    return satisfied;
  }

  function sequences() {
    let builders = makeAllBuilders();
    let linksWithSequences = [];
    let createdSequences = [];

    while (builders.length > 0) {
      let newSequencesMade = false;
      let buildersToTry = getBuildersWithSatisfiedDependencies(builders, linksWithSequences);
      
      buildersToTry.forEach(b => {
        let sequences = b.sequences(edlZettel.children, createdSequences);
        if (sequences.length > 0) {
          newSequencesMade = true;
          linksWithSequences.push(sequences[0].definingLink);
        }
        createdSequences = createdSequences.concat(sequences);
      });

      builders = builders.filter(b => !buildersToTry.includes(b));
      if (!newSequencesMade) { break; } // this is protection against infinite loops
    }

    return createdSequences;
  }

  

  return finalObject(obj, {
    sequences    
  });
}
