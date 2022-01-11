import { addProperties, finalObject } from "./utils";
import { spanTesting } from "./span";
import { Clip } from "./clip";
import { Part } from "./part";

export function Box(origin, x, y, width, height, originalContext)
{
  let obj = Clip("box", origin, r => buildPartFromContent(obj, r), originalContext);
  let nextX = x + width, nextY = y + height;
  addProperties(obj, {
    x,
    y,
    width,
    height,
    nextX,
    nextY,
    rightEdge: nextX - 1,
    bottomEdge: nextY - 1,
    length: 1
  });

  function clone({
    origin = obj.origin,
    x = obj.x,
    y = obj.y,
    height = obj.height,
    width = obj.width } = {}) {
    return Box(origin, x, y, width, height);
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

  function overlaps(box) {
    return (origin === box.origin
      && x < box.x + box.width
      && box.x < x + width
      && y < box.y + box.height
      && box.y < y + height);
  }

  function merge(b) {
    let newX = Math.min(x, b.x), newY = Math.min(y, b.y);
    return Box(
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
    return {typ: obj.clipType, ori: origin, x, y, wd: width, ht: height };
  }

  function contains(pointX, pointY) {
    let offset = pointX - x;
    if (offset >= 0 && offset < width) {
      offset = pointY - y;
    return offset >= 0 && offset < height;
    }
    return false;
  }

  function engulfs(box) {
    return origin === box.origin 
    && contains(box.x, box.y)
    && contains(box.rightEdge, box.bottomEdge);
  }

  function intersect(box) {
    if (!overlaps(box)) {
      return [false, undefined];
    }
    let newX = Math.max(box.x, x), newY = Math.max(box.y, y);
    return [true, Box(
                    origin,
                    newX,
                    newY,
                    Math.min(box.nextX, obj.nextX) - newX,
                    Math.min(box.nextY, obj.nextY) - newY)];
  }

  return finalObject(obj, {
    clone,
    abutsHorizontally,
    abutsVertically,
    abuts,
    merge,
    boxCrop,
    crop: () => obj,
    leafData,
    overlaps,
    contains,
    engulfs,
    intersect
  });
}

export function leafDataToBox(leafData) {
  return Box(leafData.ori, leafData.x, leafData.y, leafData.wd, leafData.ht);
}

function buildPartFromContent(originalBox, response) {
  return new Promise((resolve, reject) => {
    response.blob()
    .then(content => {
      let url = URL.createObjectURL(content);
      let img = new Image();
      img.src = url;
      img.onload = function()
        {
          let newBox = Box(originalBox.origin, 0, 0, this.width, this.height);
          resolve(Part(newBox, content));
        };
    })
    .catch(reason => reject(reason));
  });
}

export let boxTesting = {
  makeBox({origin = "origin", x = 10, y = 11, width = 20, height = 25} = {}) {
    return Box(origin, x, y, width, height);
  },

  toEqualBox(actualBox, expectedBox) {
    return spanTesting.compareElements(actualBox, expectedBox, (actual, expected) => {
      return actual.origin === expected.origin &&
        actual.x === expected.x &&
        actual.y === expected.y &&
        actual.height === expected.height &&
        actual.width === expected.width;
    });
  }
}
