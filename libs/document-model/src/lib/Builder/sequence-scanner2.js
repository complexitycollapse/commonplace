import { finalObject } from "@commonplace/utils";
import { SequenceBuilder2 } from "./sequence-builder2";

// Scans through an edlZettel and creates all of its valid sequences
export function SequenceScanner2(edlZettel) {
  let obj = {};

  function makeAllBuilders() {
    let allSequenceDetails = edlZettel.renderLinks.map(l => l.renderEnds.map(e => l.sequenceDetailsEndowmentPrototypes(e)).flat()).flat();
    let builders = allSequenceDetails.map(SequenceBuilder2);
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
          linksWithSequences.push(sequences[0].definingLink.pointer);
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
