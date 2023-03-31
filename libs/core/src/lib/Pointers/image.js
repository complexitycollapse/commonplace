import { addProperties, finalObject } from "@commonplace/utils";
import { spanTesting } from "./span";
import { Clip, compareOriginalContexts } from "./clip";
import { Part } from "../part";
import { leafDataToPointer } from "./leaf-data-to-pointer";

export function Image(origin, x, y, width, height, originalContext)
{
  let obj = Clip("image", origin, r => buildPartFromContent(obj, r), () => `image:${origin}:${x}:${y}:${width}:${height}`, originalContext);
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
    return Image(origin, x, y, width, height);
  }

  function abutsHorizontally(image) {
    return obj.equalOrigin(image) &&
      y === image.y &&
      height === image.height &&
      obj.nextX === image.x;
  }

  function abutsVertically(image) {
    return obj.equalOrigin(image) &&
      x === image.x &&
      width === image.width &&
      obj.nextY === image.y;
  }

  function abuts(image) {
    return abutsHorizontally(image) || abutsVertically(image);
  }

  function overlaps(image) {
    return (origin === image.origin
      && x < image.x + image.width
      && image.x < x + width
      && y < image.y + image.height
      && image.y < y + height);
  }

  function merge(b) {
    let newX = Math.min(x, b.x), newY = Math.min(y, b.y);
    return Image(
      obj.origin,
      newX,
      newY,
      Math.max(obj.nextX, b.nextX) - newX,
      Math.max(obj.nextY, b.nextY) - newY);
  }

  function imageCrop(xAdjust, yAdjust, newWidth, newHeight) {
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
    return {typ: obj.pointerType, ori: origin, x, y, wd: width, ht: height, ctx: obj.originalContext?.leafData() };
  }

  function contains(pointX, pointY) {
    let offset = pointX - x;
    if (offset >= 0 && offset < width) {
      offset = pointY - y;
    return offset >= 0 && offset < height;
    }
    return false;
  }

  function engulfs(image) {
    return origin === image.origin
    && contains(image.x, image.y)
    && contains(image.rightEdge, image.bottomEdge);
  }

  function intersect(image) {
    if (!overlaps(image)) {
      return [false, undefined];
    }
    let newX = Math.max(image.x, x), newY = Math.max(image.y, y);
    return [true, Image(
                    origin,
                    newX,
                    newY,
                    Math.min(image.nextX, obj.nextX) - newX,
                    Math.min(image.nextY, obj.nextY) - newY)];
  }

  function clipPart(part) {
    let intersection = intersect(part.pointer);

    if (!intersection[0]) {
      return [false, undefined];
    }

    return [true, Part(intersection[1], part.content)];
  }

  return finalObject(obj, {
    clone,
    abutsHorizontally,
    abutsVertically,
    abuts,
    merge,
    imageCrop,
    crop: () => obj,
    leafData,
    overlaps,
    contains,
    engulfs,
    intersect,
    clipPart
  });
}

export function leafDataToImage(leafData) {
  return Image(leafData.ori, leafData.x, leafData.y, leafData.wd, leafData.ht, leafData.ctx ? leafDataToPointer(leafData.ctx) : undefined);
}

function buildPartFromContent(originalImage, response) {
  return new Promise((resolve, reject) => {
    response.blob()
    .then(content => {
      let url = URL.createObjectURL(content);
      let img = new Image();
      img.src = url;
      img.onload = function()
        {
          let newImage = Image(originalImage.origin, 0, 0, this.width, this.height);
          resolve(Part(newImage, content));
        };
    })
    .catch(reason => reject(reason));
  });
}

export let imageTesting = {
  makeImage({origin = "origin", x = 10, y = 11, width = 20, height = 25} = {}) {
    return Image(origin, x, y, width, height);
  },

  toEqualImage(actualImage, expectedImage) {
    return spanTesting.compareElements(actualImage, expectedImage, (actual, expected) => {
      return actual.origin === expected.origin &&
        actual.x === expected.x &&
        actual.y === expected.y &&
        actual.height === expected.height &&
        actual.width === expected.width &&
        compareOriginalContexts(actual, expected);
    });
  }
}
