import { describe, expect, it, test } from 'vitest';
import { Image, leafDataToImage, imageTesting } from "./image";
import { spanTesting } from './span';
import { EdlPointer } from './edl-pointer';
import { Part } from '../part';

expect.extend({
  toEqualImage: imageTesting.toEqualImage
});

let make = imageTesting.makeImage;

function makePart(image) {
  return Part(image, new Blob());
}

describe('image', () => {
  it('has origin, x, y, width and height', () => {
    let actual = Image('origin', 1, 100, 200, 250);
    expect(actual.origin).toBe('origin');
    expect(actual.x).toBe(1);
    expect(actual.y).toBe(100);
    expect(actual.width).toBe(200);
    expect(actual.height).toBe(250);
  });

  it('can be used to set originalContext', () => {
    let originalContext = EdlPointer("doc name");
    let actual = Image('origin', 1, 100, 200, 250, originalContext);
    expect(actual.originalContext).toBe(originalContext);
  });

  it('allows originalContext to be undefined', () => {
    let actual = Image('origin', 1, 100, 200, 250);
    expect(actual.originalContext).toBe(undefined);
  });
});

describe('clone', () => {
  it('produces an exact copy when there are no arguments', () => {
    let original = make();
    expect(original.clone()).toEqualImage(original);
  });

  it('produces an exact copy when passed an empty object', () => {
    let original = make();
    expect(original.clone({})).toEqualImage(original);
  });

  it('replaces only origin when that is passed as a parameter', () => {
    let b = make();
    expect(b.clone({ origin: 'other' })).toEqualImage(Image('other', b.x, b.y, b.width, b.height));
  });

  it('replaces only x when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ x: 99 })).toEqualImage(Image(b.origin, 99, b.y, b.width, b.height));
  });

  it('replaces only y when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ y: 99 })).toEqualImage(Image(b.origin, b.x, 99, b.width, b.height));
  });

  it('replaces only width when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ width: 99 })).toEqualImage(Image(b.origin, b.x, b.y, 99, b.height));
  });

  it('replaces only height when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ height: 99 })).toEqualImage(Image(b.origin, b.x, b.y, b.width, 99));
  });
});

describe('basic image functions', () => {
  test('isClip returns true', () => {
    expect(make().isClip).toBeTruthy();
  });

  test('isLink is false', () => {
    expect(make().isLink).toBeFalsy();
  });

  test('clip type returns image', () => {
    expect(make().pointerType).toBe("image");
  });

  test('same type returns true for another image', () => {
    expect(make().sameType(make())).toBeTruthy();
  });

  test('same type returns false for a span', () => {
    expect(make().sameType(spanTesting.makeSpan())).toBeFalsy();
  });

  test('length is always 1', () => {
    expect(Image(0, 0, 1, 1).length).toBe(1);
    expect(Image(0, 0, 2, 2).length).toBe(1);
    expect(Image(4, 14, 100, 27).length).toBe(1);
  });

  test('nextX returns the x position exactly to the right after the end of the image', () => {
    expect(make({x: 5, width: 100}).nextX).toBe(105);
  });

  test('nextY returns the y position exactly below the bottom of the image', () => {
    expect(make({y: 10, height: 50}).nextY).toBe(60);
  });

  test('rightEdge returns the x position of the rightmost point within the image', () => {
    expect(make({x: 5, width: 100}).rightEdge).toBe(104);
  });

  test('bottonEdge returns the y position of the lowest point within the image', () => {
    expect(make({y: 10, height: 50}).bottomEdge).toBe(59);
  });

  test('equalOrigin returns true if the origins are the same', () => {
    expect(Image('origin1', 10, 20, 30, 40).equalOrigin(Image('origin1', 15, 25, 35, 45)));
  });

  test('equalOrigin returns false if the origins are different', () => {
    expect(Image('origin1', 10, 20, 30, 40).equalOrigin(Image('origin2', 10, 20, 30, 40)));
  });
});

describe('abutsHorizontally', () => {
  it('returns true when the nextX position of the 1st image is equal to the x of the 2nd and other properties (ignoring width) are equal', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX, width: 1000 });
    expect(b1.abutsHorizontally(b2)).toBeTruthy();
  });

  it('returns false if the images have different origins', () => {
    let b1 = make();
    let b2 = b1.clone({ origin: "something else", x: b1.nextX, width: 1000 });
    expect(b1.abutsHorizontally(b2)).toBeFalsy();
  });

  it('returns false if the images have different y positions', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX, width: 1000, y: b1.y + 1 });
    expect(b1.abutsHorizontally(b2)).toBeFalsy();
  });

  it('returns false if the images have different heights', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX, width: 1000, height: b1.height + 1 });
    expect(b1.abutsHorizontally(b2)).toBeFalsy();
  });

  it('returns false if the images overlap on the x axis', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.rightEdge, width: 1000 });
    expect(b1.abutsHorizontally(b2)).toBeFalsy();
  });

  it('returns false if they abut the wrong way round', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX, width: 1000 });
    expect(b2.abutsHorizontally(b1)).toBeFalsy();
  });

  it('returns false if the images have a gap between them on the x axis', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX + 1, width: 1000 });
    expect(b1.abutsHorizontally(b2)).toBeFalsy();
  });
});

describe('abutsVertically', () => {
  it('returns true when the nextY position of the 1st image is equal to the y of the 2nd and other properties (ignoring height) are equal', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.nextY, height: 1000 });
    expect(b1.abutsVertically(b2)).toBeTruthy();
  });

  it('returns false if the images have different origins', () => {
    let b1 = make();
    let b2 = b1.clone({ origin: "something else", y: b1.nextY });
    expect(b1.abutsVertically(b2)).toBeFalsy();
  });

  it('returns false if the images have different y positions', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.nextY, x: b1.x + 1 });
    expect(b1.abutsVertically(b2)).toBeFalsy();
  });

  it('returns false if the images have different widths', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.nextY, width: b1.width + 1 });
    expect(b1.abutsVertically(b2)).toBeFalsy();
  });

  it('returns false if the images overlap on the y axis', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.bottomEdge });
    expect(b1.abutsVertically(b2)).toBeFalsy();
  });

  it('returns false if they abut the wrong way round', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.nextY });
    expect(b2.abutsVertically(b1)).toBeFalsy();
  });

  it('returns false if the images have a gap between them on the y axis', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.nextY + 1 });
    expect(b1.abutsVertically(b2)).toBeFalsy();
  });
});

describe('abuts', () => {
  it('returns true if they abut horizontally', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX });
    expect(b1.abuts(b2)).toBeTruthy();
  });

  it('returns true if they abut vertically', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.nextY });
    expect(b1.abuts(b2)).toBeTruthy();
  });

  it('returns false if they abut neither horizontally or vertically', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.rightEdge, y: b1.bottomEdge });
    expect(b1.abuts(b2)).toBeFalsy();
  });
});

describe('merge', () => {
  it('returns an identical image if the argument is contained in this', () => {
    let b1 = Image("o", 10, 10, 20, 20);
    let b2 = Image ("o", 11, 11, 10, 10);
    expect(b1.merge(b2)).toEqualImage(b1);
  });

  it('returns a image identical to the argument if this is contained in the argument', () => {
    let b1 = Image("o", 10, 10, 20, 20);
    let b2 = Image ("o", 11, 11, 10, 10);
    expect(b2.merge(b1)).toEqualImage(b1);
  });

  it('returns a image identical to the original if they are both equal', () => {
    let b1 = Image("o", 10, 10, 20, 20);
    let b2 = Image("o", 10, 10, 20, 20);
    expect(b1.merge(b2)).toEqualImage(b1);
  });

  it('uses the origin from the images', () => {
    let b1 = Image("original", 10, 10, 20, 20);
    let b2 = Image("original", 10, 10, 20, 20);
    expect(b1.merge(b2).origin).toEqualImage("original");
  });

  describe('when they abut horizontally', () => {
    it('returns a image encompassing both images if this is to the left of that', () => {
      let b1 = Image("c", 10, 10, 20, 20);
      let b2 = Image("c", 11, 10, 30, 20);
      expect(b1.merge(b2)).toEqualImage(Image("c", 10, 10, 31, 20));
    });

    it('returns a image encompassing both images if that is to the left of this', () => {
      let b1 = Image("d", 10, 10, 20, 20);
      let b2 = Image("d", 11, 10, 30, 20);
      expect(b2.merge(b1)).toEqualImage(Image("d", 10, 10, 31, 20));
    });
  });

  describe('when they abut vertically', () => {
    it('returns a image encompassing both images if this is to the left of that', () => {
      let b1 = Image("e", 10, 10, 20, 20);
      let b2 = Image("e", 10, 11, 20, 30);
      expect(b1.merge(b2)).toEqualImage(Image("e", 10, 10, 20, 31));
    });

    it('returns a image encompassing both images if that is to the left of this', () => {
      let b1 = Image("f", 10, 10, 20, 20);
      let b2 = Image("f", 10, 11, 20, 30);
      expect(b2.merge(b1)).toEqualImage(Image("f", 10, 10, 20, 31));
    });
  });
});

describe('imageCrop', () => {
  it('returns an identical image if whole image is selected', () => {
    let b = make();
    expect(b.imageCrop(0, 0, b.width, b.height)).toEqualImage(b);
  });

  it('removes leftmost elements if xAdjust is greater than 0', () => {
    let b = make();
    expect(b.imageCrop(2, 0, b.width, b.height)).toEqualImage(b.clone({x: b.x + 2, width: b.width - 2}));
  });

  it('removes topmost elements if yAdjust is greater than 0', () => {
    let b = make();
    expect(b.imageCrop(0, 2, b.width, b.height)).toEqualImage(b.clone({y: b.y + 2, height: b.height - 2}));
  });

  it('removes rightmost elements if width is less than the image width', () => {
    let b = make();
    expect(b.imageCrop(0, 0, b.width - 2, b.height)).toEqualImage(b.clone({width: b.width - 2}));
  });

  it('removes bottommost elements if height is less than the image height', () => {
    let b = make();
    expect(b.imageCrop(0, 0, b.width, b.height - 2)).toEqualImage(b.clone({height: b.height - 2}));
  });

  it('always returns a image of the given width, even when leftmost elements are removed, so long as the requested width is shorter or equal to the original', () => {
    let b = make();
    expect(b.imageCrop(1, 0, b.width - 2, b.height).width).toBe(b.width - 2);
  });

  it('always returns a image of the given height, even when leftmost elements are removed, so long as the requested height is shorter or equal to the original', () => {
    let b = make();
    expect(b.imageCrop(1, 0, b.width, b.height - 2).height).toBe(b.height - 2);
  });

  it('removes leftmost and rightmost elements if a narrow image is requested', () => {
    let b = make();
    expect(b.imageCrop(1, 0, b.width - 2, b.height)).toEqualImage(b.clone({x: b.x + 1, width: b.width - 2}));
  });

  it('removes topmost and bottommost elements if a short image is requested', () => {
    let b = make();
    expect(b.imageCrop(0, 1, b.width, b.height - 2)).toEqualImage(b.clone({y: b.y + 1, height: b.height - 2}));
  });

  it('removes no rightmost or bottommost elements if width and height are not passed', () => {
    let b = make();
    expect(b.imageCrop(1, 1)).toEqualImage(b.clone({x: b.x + 1, y: b.y + 1, width: b.width - 1, height: b.height - 1}));
  });

  it('removes no rightmost or bottommost elements if width or height are greater than the image dimensions', () => {
    let b = make();
    expect(b.imageCrop(1, 1, b.width + 1, b.height)).toEqualImage(b.clone({x: b.x + 1, y: b.y + 1, width: b.width - 1, height: b.height -1}));
  });

  it('treats negative xAdjust or yAdjust as equivalent to 0', () => {
    let b = make();
    expect(b.imageCrop(-1, -1, b.width - 1, b.height - 1)).toEqualImage(b.imageCrop(0, 0, b.width - 1, b.height - 1));
  });
});

describe('leafData', () => {
  it('has the typ, ori, x, y, wd and ht properties when originalContext is missing', () => {
    expect(Image("a", 101, 505, 22, 33).leafData()).toEqual({
      typ: "image",
      ori: "a",
      x: 101,
      y: 505,
      wd: 22,
      ht: 33
    });
  });

  it('has the typ, ori, x, y, wd, ht and ctx properties when originalContext is present', () => {
    expect(Image("a", 101, 505, 22, 33, EdlPointer("foo")).leafData()).toEqual({
      typ: "image",
      ori: "a",
      x: 101,
      y: 505,
      wd: 22,
      ht: 33,
      ctx: { typ: "edl", name: "foo" }
    });
  });
});

test('leafDataToImage is inverse of leafData when originalContext missing', () => {
  let b = Image("orig", 1, 2, 101, 202);
  expect(leafDataToImage(b.leafData())).toEqualImage(b);
});

test('leafDataToImage is inverse of leafData when originalContext present', () => {
  let b = Image("orig", 1, 2, 101, 202, EdlPointer("foo"));
  expect(leafDataToImage(b.leafData())).toEqualImage(b);
});

describe('overlaps', () => {
  it('returns true when the two images are the same image', () => {
    let b1 = make();

    expect(b1.overlaps(b1)).toBeTruthy();
  });

  it('returns true when the two images are identical', () => {
    let b1 = make(), b2 = make();

    expect(b1.overlaps(b2)).toBeTruthy();
  });

  it('returns true if one image is contained in the other', () => {
    let b1 = make({x: 0, width: 10, y: 0, height: 10}), b2 = make({x: 1, width: 8, y: 1, height: 8});

    expect(b1.overlaps(b2)).toBeTruthy();
    expect(b2.overlaps(b1)).toBeTruthy();
  });

  it('returns false if they have different origins', () => {
    let b1 = make({origin: "1"}), b2 = make({origin: "2"});

    expect(b1.overlaps(b2)).toBeFalsy();
  });

  it('returns false if they do not overlap on the x axis', () => {
    let b1 = make({x: 0, width: 10}), b2 = make({x: 10});

    expect(b1.overlaps(b2)).toBeFalsy();
    expect(b2.overlaps(b1)).toBeFalsy();
  });

  it('returns false if they do not overlap on the y axis', () => {
    let b1 = make({y: 0, height: 10}), b2 = make({y: 10});

    expect(b1.overlaps(b2)).toBeFalsy();
    expect(b2.overlaps(b1)).toBeFalsy();
  });

  it('returns false if they do not overlap on the x or y axis', () => {
    let b1 = make({x: 0, width: 10, y: 0, height: 10}), b2 = make({x: 10, y: 10});

    expect(b1.overlaps(b2)).toBeFalsy();
    expect(b2.overlaps(b1)).toBeFalsy();
  });

  it('returns true if they overlap on the x and y axis', () => {
    let b1 = make({x: 0, width: 10, y: 0, height: 10}), b2 = make({x: 1, width: 20, y: 1, height: 20});

    expect(b1.overlaps(b2)).toBeTruthy();
    expect(b2.overlaps(b1)).toBeTruthy();
  });
});

describe('contains', () => {
  it('is false if the point is to the left of the image', () => {
    let image = make({x: 10});
    expect(image.contains(9, image.y)).toBeFalsy();
  });

  it('is false if the point is to the right of the image', () => {
    let image = make({x: 10, width: 10});
    expect(image.contains(20, image.y)).toBeFalsy();
  });

  it('is true if the point is at the left edge of the image', () => {
    let image = make();
    expect(image.contains(image.x, image.y)).toBeTruthy();
  });

  it('is true if the point is at the right edge of the image', () => {
    let image = make();
    expect(image.contains(image.rightEdge, image.y)).toBeTruthy();
  });

  it('is true if the point is within the image', () => {
    let image = make({x: 10, width: 10});
    expect(image.contains(15, image.y)).toBeTruthy();
  });

  it('is true if the image is one point wide and the point equals it', () => {
    let image = make({width:1});
    expect(image.contains(image.x, image.y)).toBeTruthy();
  });

  it('is false if the point is above the image', () => {
    let image = make({y: 10});
    expect(image.contains(image.x, 9)).toBeFalsy();
  });

  it('is false if the point is below the image', () => {
    let image = make({y: 10, height: 10});
    expect(image.contains(image.x, 20)).toBeFalsy();
  });

  it('is true if the point is at the top edge of the image', () => {
    let image = make();
    expect(image.contains(image.x, image.y)).toBeTruthy();
  });

  it('is true if the point is at the bottom edge of the image', () => {
    let image = make();
    expect(image.contains(image.x, image.bottomEdge)).toBeTruthy();
  });

  it('is true if the point is within the image', () => {
    let image = make({y: 10, height: 10});
    expect(image.contains(image.x, 15)).toBeTruthy();
  });

  it('is true if the image is one point high and the point equals it', () => {
    let image = make({height:1});
    expect(image.contains(image.x, image.y)).toBeTruthy();
  });
});

describe('engulfs', () => {
  it('returns true if the images are equal', () => {
    let image = make();
    expect(image.engulfs(image.clone())).toBeTruthy();
  });

  it('returns true if one image contains the other', () => {
    let image = make({x: 10, y: 12, width: 5, height: 15});
    expect(image.engulfs(image.clone({x: 11, y: 13, width: 3, height: 13}))).toBeTruthy();
  });

  it('returns false if the images have different origins', () => {
    let image = make();
    expect(image.engulfs(image.clone({origin: "something else"}))).toBeFalsy();
  });

  it('returns false if that starts to the left of this', () => {
    let image = make();
    expect(image.engulfs(image.clone({x: image.x - 1}))).toBeFalsy();
  });

  it('returns false if that ends after this', () => {
    let image = make();
    expect(image.engulfs(image.clone({width: image.width + 1}))).toBeFalsy();
  });

  it('returns false if that starts above this', () => {
    let image = make();
    expect(image.engulfs(image.clone({y: image.y - 1}))).toBeFalsy();
  });

  it('returns false if that ends below this', () => {
    let image = make();
    expect(image.engulfs(image.clone({height: image.height + 1}))).toBeFalsy();
  });

  it('returns false if they do not overlap at all', () => {
    let image = make({x: 10, y: 12, width: 5, height: 15});
    expect(image.engulfs(image.clone({x: 100, y: 120, width: 100, height: 20}))).toBeFalsy();
  });
});

describe('intersect', () => {
  it('returns [false, undefined] if the images do not overlap', () => {
    let b1 = make();
    let b2 = b1.clone({x: b1.nextX});

    expect(b1.intersect(b2)).toEqual([false, undefined]);
  });

  it('returns [true, result] if the images overlap', () => {
    let b1 = make();
    let b2 = b1.clone({x: b1.nextX - 1});

    expect(b1.intersect(b2)[0]).toEqual(true);
  });

  it('returns the original image if the second is equal to it', () => {
    let b1 = make();
    let b2 = b1.clone();

    expect(b1.intersect(b2)[1]).toEqual(b1);
  });

  it('returns the original dimensions if the second image encompasses it', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.x - 1, y: b1.y - 1, width: b1.width + 2, height: b1.height + 2 });

    expect(b1.intersect(b2)[1]).toEqual(b1);
  });

  it('returns the dimensions of the second image if we encompass it', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.x - 1, y: b1.y - 1, width: b1.width + 2, height: b1.height + 2 });

    expect(b2.intersect(b1)[1]).toEqual(b1);
  });

  it('has the x of the other image if that is later', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.x + 1});

    expect(b1.intersect(b2)[1].x).toBe(b2.x);
  });

  it('has the y of the other image if that is later', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.y + 1});

    expect(b1.intersect(b2)[1].y).toBe(b2.y);
  });

  it('has the x of this image if that is later', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.x + 1});

    expect(b2.intersect(b1)[1].x).toBe(b2.x);
  });

  it('has the y of this image if that is later', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.y + 1});

    expect(b2.intersect(b1)[1].y).toBe(b2.y);
  });

  it('has the nextX of the other image if that is lesser', () => {
    let b1 = make();
    let b2 = b1.clone({ width: b1.width - 1});

    expect(b1.intersect(b2)[1].nextX).toBe(b2.nextX);
  });

  it('has the nextY of the other image if that is lesser', () => {
    let b1 = make();
    let b2 = b1.clone({ height: b1.height - 1});

    expect(b1.intersect(b2)[1].nextY).toBe(b2.nextY);
  });

  it('has the nextX of the other image if that is greater', () => {
    let b1 = make();
    let b2 = b1.clone({ width: b1.width - 1});

    expect(b2.intersect(b1)[1].nextX).toBe(b2.nextX);
  });

  it('has the nextY of the other image if that is greater', () => {
    let b1 = make();
    let b2 = b1.clone({ height: b1.height - 1});

    expect(b2.intersect(b1)[1].nextY).toBe(b2.nextY);
  });

  it('is equal to the overlapping section if this is lefter than the other', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.x + 1, width: b1.width + 3});

    expect(b1.intersect(b2)[1].x).toBe(b2.x);
    expect(b1.intersect(b2)[1].nextX).toBe(b1.nextX);
  });

  it('is equal to the overlapping section if this is to higher than the other', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.y + 1, height: b1.height + 3});

    expect(b1.intersect(b2)[1].y).toBe(b2.y);
    expect(b1.intersect(b2)[1].nextY).toBe(b1.nextY);
  });

  it('is equal to the overlapping section if this is righter than the other', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.x + 1, width: b1.width + 3});

    expect(b2.intersect(b1)[1].x).toBe(b2.x);
    expect(b2.intersect(b1)[1].nextX).toBe(b1.nextX);
  });

  it('is equal to the overlapping section if this is to lower than the other', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.y + 1, height: b1.height + 3});

    expect(b2.intersect(b1)[1].y).toBe(b2.y);
    expect(b2.intersect(b1)[1].nextY).toBe(b1.nextY);
  });
});

describe('clipPart', () => {
  it('returns [false, undefined] if the images do not overlap', () => {
    let b1 = make();
    let b2 = b1.clone({x: b1.nextX});

    expect(b1.clipPart(makePart(b2))).toEqual([false, undefined]);
  });

  it('returns [true, result] if the images overlap', () => {
    let b1 = make();
    let b2 = b1.clone({x: b1.nextX - 1});

    expect(b1.clipPart(makePart(b2))[0]).toEqual(true);
  });

  it('returns the intersection of the two images', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.y + 1, height: b1.height + 3});

    expect(b2.clipPart(makePart(b1))[1].pointer).toEqual(b2.intersect(b1)[1]);
  });

  it('returns the associated content unchanged', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.y + 1, height: b1.height + 3});
    let part = Part(b2, new Blob());

    expect(b2.clipPart(part)[1].content).toBe(part.content);
  });
});

