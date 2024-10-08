import { finalObject } from '@commonplace/utils';
import { SequenceBuildingCursor } from './sequence-building-cursor.js';

// Builds all sequences for a given SequencePrototype that are present in a list of zettel
export function SequenceBuilder(sequencePrototype) {
  let obj = {};
  let linkDependencies = sequencePrototype.end.pointers.filter(p => p.pointerType === "link");

  function areDependenciesSatisfied(linksWithSequences) {
    return linkDependencies.every(d => linksWithSequences.find(l => l.hashableName === d.hashableName));
  }

  function sequences(zettel, existingSequences) {
    let builders = [];
    let completeSequences = [];

    function explodeSubsequences(b, zettel) {
      let requiredLink = b.stalledOnLink();
  
      function isPotentialNestedSequence(sequence) {
        let definedByRequiredLink = sequence.definingLink.pointer.denotesSame(requiredLink);
        if (!definedByRequiredLink) { return false; }

        let firstZettelMember = sequence.members[0];
        for(; firstZettelMember.isSequence; firstZettelMember = firstZettelMember.members[0]);

        let isInCorrectPlace = firstZettelMember == zettel;
        return definedByRequiredLink && isInCorrectPlace;
      }

      if (requiredLink) {
        let matchingSequences = existingSequences.filter(isPotentialNestedSequence);
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

      let newBuilder = SequenceBuildingCursor(sequencePrototype);
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
