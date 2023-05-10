export default function getClasses() {
  let classes = this.incomingPointers.map(p => p.end.semanticClasses).flat();
  return classes;
}
