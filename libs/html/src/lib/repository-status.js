import { addProperties } from "@commonplace/utils";

export function repositoryStatus(docName, repository) {
  let doc = repository.check(docName);

  if (doc === undefined) { return { status: repositoryStatus.docStatus, required: [docName]}; }

  let linkResults = doc.links.map(l => [l, repository.check(l)]);
  let missingLinkNames = linkResults.filter(l => l[1] === undefined).map(l => l[0]);
  let foundLinks = linkResults.filter(l => l[1] !== undefined).map(l => l[1]);
  let linkContentPointers = foundLinks.maps(l => l.ends).flat().map(e => e.pointers).flat()
    .filter(p => p.specifiesContent && !repository.check(p));
  let docContent = doc.clips.filter(c => !repository.check(c));

  let status = missingLinkNames.length > 0 ? repositoryStatus.linksStatus
    : (linkContentPointers.length > 0 ? repositoryStatus.linkContentStatus
      : repositoryStatus.docContentStatus);

  return {
    status,
    required: missingLinkNames.concat(linkContentPointers).concat(docContent)
  };
}

addProperties(repositoryStatus, {
  docStatus: "Retrieving document",
  linksStatus: "Downloading links",
  linkContentStatus: "Downloading link content",
  docContentStatus: "Downloading doc content"
});
