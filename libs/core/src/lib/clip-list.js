import { leafDataToBox } from './box';
import { ClipIterator } from './clip-iterator';
import { leafDataToSpan } from './span';
import { finalObject, addProperties } from './utils';

export function ClipList(...clipDesignators) {
  let obj = {};
  let clips = [];

  {
    let last = undefined;
    clipDesignators.forEach(x => x.clipSource().forEach(s => {
      if (last !== undefined) {
        if (last.abuts(s)) {
          clips.pop();
          s = last.merge(s);
        }
      }
      last = s;
      clips.push(s);
    }));
  }

  addProperties(obj, {
    clips
  });

  function append(clip) {
    clips.push(clip);
  }

  function clipSource() {
    return ClipIterator(state => [state.shift(), state], [...clips]);
  }

  function range(start, length) {
    if (length === 0) return ClipList();

    let rangeSpans = [];
    let i = 0;

    while(clips[i] !== undefined && start >= clips[i].length) {
      start -= clips[i].length;
      i += 1;
    }

    if (clips[i] === undefined) return ClipList();

    let firstSpan = clips[i].crop(start, length);
    rangeSpans.push(firstSpan);
    length -= firstSpan.length;
    i += 1;

    while(clips[i] !== undefined && length > 0) {
      rangeSpans.push(clips[i].crop(0, length));
      length -= clips[i].length;
      i += 1;
    }
    
    return ClipList(...rangeSpans);
  }

  function leafData() {
    return clips.map(c => c.leafData());
  }

  return finalObject(obj, {
    concLength: () => clips.map(s => s.length).reduce((a, b) => a + b, 0),
    append,
    clipSource: clipSource,
    range,
    leafData
  });
}

export function leafDataToClipList(leafData) {
  return ClipList(...leafData.map(leafDataToClip));
}

export function leafDataToClip(leafData) {
  if (leafData.typ === "span") {
    return leafDataToSpan(leafData);
  } else if (leafData.typ === "box") {
    return leafDataToBox(leafData);
  } else {
    throw `leafDataToClip does not understand '${leafData}'`;
  }
}
