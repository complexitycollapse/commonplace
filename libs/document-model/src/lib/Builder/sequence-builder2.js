import { finalObject } from '@commonplace/utils';
import { SequenceBuildingCursor2 } from './sequence-building-cursor2';

// Builds all sequences for a given SequenceDetails that are present in a list of zettel
export function SequenceBuilder2(sequenceDetails) {
  let obj = {};
  let linkDependencies = sequenceDetails.end.pointers.filter(p => p.pointerType === "link");

  function areDependenciesSatisfied(links) {
    return linkDependencies.every(d => links.find(l => l.hashableName === d.hashableName));
  }

  function sequences(zettel, existingSequences) {
    let builders = [];
    let completeSequences = [];

    function explodeSubsequences(b, zettel) {
      let requiredLink = b.stalledOnLink();
  
      if (requiredLink) {
        let matchingSequences = existingSequences.filter(s => s.definingLink.pointer.denotesSame(requiredLink));
        let cursorsForSequences = matchingSequences.map(s => {
          let newCursor = b.clone();
          newCursor.consumeSequence(s);
          let result = newCursor.consumeZettel(zettel);
          if (newCursor.isComplete()) { completeSequences.push(newCursor.pushSequence()); }
          return result ? newCursor : undefined;
        });
        return cursorsForSequences.filter(c => c !== undefined);
      } else {
        return undefined;
      }
    }

    zettel.forEach(z => {
      let newBuilders = [];
      let deadBuilders = [];
      
      builders.forEach(b => {
        let explodedBuilders = explodeSubsequences(b, z);

        if (explodedBuilders != undefined) {
          deadBuilders.push(b);
          newBuilders = newBuilders.concat(explodedBuilders.filter(c => !c.isComplete()));
        } else {
          let result = b.consumeZettel(z);
          let complete = b.isComplete();

          if (complete) { completeSequences.push(b.pushSequence()); }
          if (complete || !result) {
            deadBuilders.push(b);
          }
        }
      });

      let newBuilder = SequenceBuildingCursor2(sequenceDetails);
      let explodedBuilders = explodeSubsequences(newBuilder, z);
      if (explodedBuilders != undefined) {
        newBuilders = newBuilders.concat(explodedBuilders.filter(c => !c.isComplete()));
      } else {
        let result = newBuilder.consumeZettel(z);
        if (newBuilder.isComplete()) { completeSequences.push(newBuilder.pushSequence()); }
        else if (result) { newBuilders.push(newBuilder); }
      }
      
      builders = builders.filter(b => !deadBuilders.includes(b));
      builders = builders.concat(newBuilders);
    });

    return completeSequences;
  }

  return finalObject(obj, {
    areDependenciesSatisfied,
    sequences
  });
}
