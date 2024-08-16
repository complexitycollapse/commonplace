import { finalObject } from "@commonplace/utils";
import { SequenceBuilder } from "./sequence-builder.js";

/*
Sequence algorithm explained:
A link can define a sequence if it has an appropriate sequence metalink. A contiguous part of a document's content
forms a sequence if there is a sequence link that applies to all objects in that part, and the parts match the
sequence link's endlist exactly. If the endlist contains any links, and those links also define sequences, then
the sequence is considered hierarchical, and those links must match the content of their own endlists in order for
the sequence to be formed. If multiple sequence metalinks apply to a link, it will generate a sequence for EACH
metalink simultaneously. If the endlist contains links with multiple sequence metalinks, a parent sequence will
be generated for each possible combination. If multiple parts of the document match the endlist, they each define
a sequence.

Each sequence metalink defines a sequence prototype, which describes the kind of sequence the target link may generate.
These protoypes are added to the sequencePrototype property of the target link.

Sequences are calculated starting with the base sequences (those that do not contain any child sequences). Then all
sequences that contain those sequences are generated, and so on up the hierarchy until all are generated, if present.
In each pass, we iterate through all the zettel and, for each sequence prototype we are interested in, create a
SequenceBuilder that will attempt to match that sequence. The SequenceBuilder is fed zettel until it either completes
(i.e. it has consumed all zettel in the endlist in the correct order) or it fails to match a zettel. If it succeeds,
it will push all sequences it has discovered onto the zettel referenced in the endlist. All zettel and child sequences
are added as members of the sequence, and all sequences are then returned. The SequenceBuilder may return many
sequences because there may be many combinations of matching child sequences, due to their defining links having
multiple sequence metalinks.
*/

// Scans through a Document Model and adds all of its valid sequences
export function SequenceScanner(zettel, links) {
  let obj = {};

  function makeAllBuilders() {
    // A sequence of length zero is not valid, so exclude them.
    let validEnds = links.map(l => l.ends.filter(e => e.pointers.length > 0)).flat();
    let allSequencePrototypes = validEnds.map(e => e.sequencePrototypes).flat();
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
