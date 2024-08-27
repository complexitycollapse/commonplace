export function getClasses() {
  // TODO: this will return duplicates if a class is endowed multiple ways. Needs to make classes distinct.
  let classes = this.incomingPointers.map(p => p.end.semanticClasses).flat();
  return classes;
}

export function hasClass(klass) {
  return this.incomingPointers.find(p => p.end.semanticClasses.some(c => klass.pointer.denotesSame(c)));
}
