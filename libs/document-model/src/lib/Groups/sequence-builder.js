import { finalObject } from '@commonplace/utils';
import { SequenceBuildingCursor } from './sequence-building-cursor';

export function SequenceBuilder(sequenceDetails) {
  let obj = {};
  let linkDependencies = sequenceDetails.end.pointers.filter(p => p.pointerType === "link");

  function areDependenciesSatisfied(links) {
    return linkDependencies.every(d => links.find(l => l.hashableName === d.hashableName));
  }

  function sequences(zettel, existingSequences) {
    let builders = [];
    let completeSequences = [];

    zettel.forEach(z => {
      let newBuilders = [];
      let deadBuilders = [];
      
      builders.forEach(b => {
        let requiredLink = b.stalledOnLink();

        if (requiredLink) {
          deadBuilders.push(b);
          let matchingSequences = existingSequences.filter(s => s.definingLink.pointer.denotesSame(requiredLink));
          let cursorsForSequences = matchingSequences.map(s => {
            let newCursor = b.clone();
            newCursor.consumeSequence(s);
            if (newCursor.isComplete()) { completeSequences.push(newCursor.pushSequence()); }
            return newCursor;
          });
          newBuilders = newBuilders.concat(cursorsForSequences.filter(c => !c.complete()));
        }

        let result = b.consumeZettel(z);
        let complete = b.isComplete();

        if (complete) { completeSequences.push(b.pushSequence()); }
        if (complete || !result) {
          deadBuilders.push(b);
        }
      });

      let newBuilder = SequenceBuildingCursor(sequenceDetails);
      let result = newBuilder.consumeZettel(z);
      if (newBuilder.isComplete()) { completeSequences.push(newBuilder.pushSequence()); }
      else if (result) { newBuilders.push(newBuilder); }

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
