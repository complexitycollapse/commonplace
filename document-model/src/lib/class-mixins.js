export function getClasses() {
  // TODO: this will return duplicates if a class is endowed multiple ways. Needs to make classes distinct.
  let classes = this.incomingPointers.map(p => p.end.semanticClasses).flat();
  return classes;
}

export function hasClass(klass) {
  return this.incomingPointers.find(p => p.end.semanticClasses.some(c => klass.pointer.denotesSame(c)));
}

export function getContainerLevelsAsMaps(containers) {

  const containerLevels = containers.map(c => c.getLevels()).flat();
  const levelMap = new Map();
  const distanceMap = new Map();
  const classPointerMap = new Map();

  for (const level of containerLevels) {
    if (levelMap.has(level.classPointer.hashableName)) {
      levelMap.set(level.classPointer.hashableName, Math.max(levelMap.get(level.classPointer.hashableName), level.depth));
    } else {
      levelMap.set(level.classPointer.hashableName, level.depth);
      classPointerMap.set(level.classPointer.hashableName, level.classPointer);
    }

    distanceMap.set(level.classPointer.hashableName, level.distance + 1);
  }

  return [levelMap, distanceMap, classPointerMap];
}

export function getLevels() {
  const containers = this.getContainers();
  const [levelMap, distanceMap, classPointerMap] = getContainerLevelsAsMaps(containers);
  const klasses = this.getClasses();

  for (const klass of  klasses) {
    if (levelMap.has(klass.pointer.hashableName)) {
      levelMap.set(klass.pointer.hashableName, levelMap.get(klass.pointer.hashableName) + 1);
    } else {
      levelMap.set(klass.pointer.hashableName, 1);
      classPointerMap.set(klass.pointer.hashableName, klass.pointer);
    }

    distanceMap.set(klass.pointer.hashableName, 0);
  }

  const result = [];

  for (const [name, depth] of levelMap.entries()) {
    result.push({classPointer: classPointerMap.get(name), depth, distance: distanceMap.get(name)});
  }

  return result;
}
