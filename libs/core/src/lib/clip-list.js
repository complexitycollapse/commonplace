import { leafDataToBox } from './box';
import { ClipIterator } from './clip-iterator';
import { leafDataToSpan } from './span';
import { finalObject, addProperties } from './utils';

export function ClipList(...clipDesignators) {
  let obj = {};
  let clips = [];

  {
    let lastClip = undefined;
    clipDesignators.forEach(x => {
      x.clipSource().forEach(c => {
        if (lastClip !== undefined) {
          if (lastClip.abuts(c)) {
            clips.pop();
            c = lastClip.merge(c);
          }
        }
        lastClip = c;
        clips.push(c);
      });
    });
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

  function isSpan(x) {
    return x.isClip && x.clipType == "span";
  }

  function range(start, length) {
    if (length === 0) return ClipList();

    let rangeSpans = [];
    let i = 0;

    function editDecisionLength(ed) {
      if (ed.isClip) {
        if (ed.clipType === "span") { return ed.length; }
        else { return 1; }
      } else {
        return 0;
      }
    }

    function crop(ed, startAdjust, newLength) {
      return isSpan(ed) ? ed.crop(startAdjust, newLength) : ed;
    }

    while(clips[i] !== undefined && start >= editDecisionLength(clips[i])) {
      start -= editDecisionLength(clips[i]);
      i += 1;
    }

    if (clips[i] === undefined) return ClipList();

    let firstSpan = crop(clips[i], start, length);
    rangeSpans.push(firstSpan);
    length -= editDecisionLength(firstSpan);
    i += 1;

    while(clips[i] !== undefined && length > 0) {
      rangeSpans.push(crop(clips[i], 0, length));
      length -= editDecisionLength(clips[i]);
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
