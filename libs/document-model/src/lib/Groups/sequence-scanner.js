import { finalObject } from "@commonplace/utils";
import { SequenceBuilder } from "./sequence-builder";

export function SequenceScanner(zettel) {
  let obj = {};

  function sequences() {
    let builders = [];
    let completeSequences = [];

    zettel.forEach(z => {
      let sequenceDetailsEndowments = z.potentialSequenceDetails();
      let newBuilders = [];
      let deadBuilders = [];
      
      builders.forEach(b => {
        let result = b.consumeZettel(z);
        let complete = b.isComplete();

        if (complete) { completeSequences.push(b.pushSequence()); }
        if (complete || !result) {
          deadBuilders.push(b);
        }
      });

      sequenceDetailsEndowments.forEach(d => {
        let newBuilder = SequenceBuilder(d.type, d.end, d.link, d.signature);
        let result = newBuilder.consumeZettel(z);
        if (newBuilder.isComplete()) { completeSequences.push(newBuilder.pushSequence()); }
        else if (result) { newBuilders.push(newBuilder); }
      });

      builders = builders.filter(b => !deadBuilders.includes(b));
      builders = builders.concat(newBuilders);
    });

    return completeSequences;
  }

  return finalObject(obj, {
    sequences
  });
}
