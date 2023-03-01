import { finalObject } from "@commonplace/utils";
import { SequenceBuilder } from "./sequence-builder";

// Scans through a Document Model and adds all of its valid sequences
export function SequenceScanner(zettel, links) {
  let obj = {};

  function makeAllBuilders() {
    // A sequence of length zero is not valid, so exclude them.
    let validEnds = links.map(l => l.ends.filter(e => e.pointers.length > 0)).flat();
    let allSequencePrototypes = validEnds.map(e => e.sequencePrototypes ?? []).flat();
    let builders = allSequencePrototypes.map(SequenceBuilder);
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
        let sequences = b.sequences(zettel, createdSequences);
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
