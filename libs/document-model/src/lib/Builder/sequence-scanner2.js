import { finalObject } from "@commonplace/utils";
import { SequenceBuilder2 } from "./sequence-builder2";

// Scans through a Document Model and adds all of its valid sequences
export function SequenceScanner2(docModel) {
  let obj = {};

  function makeAllBuilders() {
    let links = Object.values(docModel.links);
    let allSequencePrototypes = links.map(l => l.ends.map(e => e.sequencePrototypes ?? []).flat()).flat();
    let builders = allSequencePrototypes.map(SequenceBuilder2);
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
        let sequences = b.sequences(docModel.zettel, createdSequences);
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
