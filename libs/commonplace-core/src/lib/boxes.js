import { addProperties, addMethods } from "./utils";
import { editIterator } from "./edit-iterators";

export function box(origin, x, y, width, height)
{
  let obj = {};
  addProperties(obj, {
    origin,
    x,
    y,
    width,
    height,
    editType: "box",
    nextX: x + width,
    nextY: y + height,
    length: 1
  });

  function clone({
    origin = obj.origin,
    x = obj.x,
    y = obj.y,
    height = obj.height,
    width = obj.width } = {}) {
    return box(origin, x, y, width, height);
  }

  function abutsHorizontally(box) {
    return obj.equalOrigin(box) &&
      y === box.y &&
      height === box.height &&
      obj.nextX === box.x;
  }

  function abutsVertically(box) {
    return obj.equalOrigin(box) &&
      x === box.x &&
      width === box.width &&
      obj.nextY === box.y;
  }

  function abuts(box) {
    return abutsHorizontally(box) || abutsVertically(box);
  }

  function merge(b) {
    let newX = Math.min(x, b.x), newY = Math.min(y, b.y);
    return box(
      obj.origin,
      newX,
      newY,
      Math.max(obj.nextX, b.nextX) - newX,
      Math.max(obj.nextY, b.nextY) - newY);
  }

  function boxCrop(xAdjust, yAdjust, newWidth, newHeight) {
    xAdjust = xAdjust > 0 ? xAdjust : 0;
    yAdjust = yAdjust > 0 ? yAdjust : 0;
    newWidth = Math.min(newWidth ?? width, width - xAdjust);
    newHeight = Math.min(newHeight ?? height, height - yAdjust);
    return clone({
      x: x + xAdjust,
      y: y + yAdjust,
      width: newWidth,
      height: newHeight});
  }

  function leafData() {
    return {typ: obj.editType, ori: origin, x, y, wd: width, hg: height };
  }

  addMethods(obj, {
    clone,
    equalOrigin: box => box.origin == origin,
    abutsHorizontally,
    abutsVertically,
    abuts,
    merge,
    boxCrop,
    editSource: () => editIterator(x => x, [obj]),
    crop: () => obj,
    leafData
  });
  
  return obj;
}
