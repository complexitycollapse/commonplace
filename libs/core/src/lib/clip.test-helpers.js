import { spanTesting } from "./span";
import { boxTesting } from "./box";
import { ClipIterator } from "./clip-iterator";

export function toEqualClip(actualClip, expectedClip) {
  if (actualClip.clipType !== expectedClip.clipType) {
    return {
      message: () => `Expected '${JSON.stringify(expectedClip)}', received '${JSON.stringify(actualClip)}'`,
      pass: false
    };
  }

  if (expectedClip.clipType == "span") {
    return spanTesting.toEqualSpan(actualClip, expectedClip);
  }

  if (expectedClip.clipType == "box") {
    return boxTesting.toEqualBox(actualClip, expectedClip);
  }

  return {
    message: () => `Clip type '${expectedClip.clipType}' not understood`,
    pass: false
  };
}

export function hasClips(el, ...clips) {
  let iterator = Array.isArray(el) ? ClipIterator(state => [state.shift(), state], [...el]) : el.clipSource();
  let i = 0;
  let failed = false;

  try {
    clips.forEach(clip => {
      if (failed === false) {
        let actual = iterator();
        let singleResult = toEqualClip(actual, clip);
        if (!singleResult.pass) {
          failed = {clip, i, actual};
          throw "test failed";
        }
        ++i;
      }
    });
  } catch (ex) {
    if (ex !== "test failed") throw ex;
  }

  if (failed) {
    return {
      message: () => `expected ${JSON.stringify(failed.clip)} at position ${failed.i}, received ${JSON.stringify(failed.actual)}`,
      pass: false
    };
  }

  if (iterator() !== undefined) {
    let remaining = 0;
    iterator.forEach(_ => ++remaining);
    return {
      message: () => `too many items in ClipList, expected ${clips.length}, actual ${remaining + i + 1}`,
      pass: false
    }
  }

  return {
    message: () => 'expected ClipLists to not contain the given clips',
    pass: true
  };
}
