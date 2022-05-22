import { describe, expect, it, test, jest } from '@jest/globals';
import { Box, leafDataToBox, boxTesting } from "./box";
import { spanTesting } from './span';
import { EdlPointer } from './edl-pointer';
import { Part } from '../part';

expect.extend({
  toEqualBox: boxTesting.toEqualBox
});

let make = boxTesting.makeBox;

function makePart(box) {
  return Part(box, new Blob());
}

describe('box', () => {
  it('has origin, x, y, width and height', () => {
    let actual = Box('origin', 1, 100, 200, 250);
    expect(actual.origin).toBe('origin');
    expect(actual.x).toBe(1);
    expect(actual.y).toBe(100);
    expect(actual.width).toBe(200);
    expect(actual.height).toBe(250);
  });

  it('can be used to set originalContext', () => {
    let originalContext = EdlPointer("doc name");
    let actual = Box('origin', 1, 100, 200, 250, originalContext);
    expect(actual.originalContext).toBe(originalContext);
  });

  it('allows originalContext to be undefined', () => {
    let actual = Box('origin', 1, 100, 200, 250);
    expect(actual.originalContext).toBe(undefined);
  });
});

describe('clone', () => {
  it('produces an exact copy when there are no arguments', () => {
    let original = make();
    expect(original.clone()).toEqualBox(original);
  });

  it('produces an exact copy when passed an empty object', () => {
    let original = make();
    expect(original.clone({})).toEqualBox(original);
  });

  it('replaces only origin when that is passed as a parameter', () => {
    let b = make();
    expect(b.clone({ origin: 'other' })).toEqualBox(Box('other', b.x, b.y, b.width, b.height));
  });

  it('replaces only x when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ x: 99 })).toEqualBox(Box(b.origin, 99, b.y, b.width, b.height));
  });

  it('replaces only y when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ y: 99 })).toEqualBox(Box(b.origin, b.x, 99, b.width, b.height));
  });

  it('replaces only width when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ width: 99 })).toEqualBox(Box(b.origin, b.x, b.y, 99, b.height));
  });

  it('replaces only height when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ height: 99 })).toEqualBox(Box(b.origin, b.x, b.y, b.width, 99));
  });
});

describe('basic box functions', () => {
  test('isClip returns true', () => {
    expect(make().isClip).toBeTruthy();
  });

  test('isLink is false', () => {
    expect(make().isLink).toBeFalsy();
  });

  test('clip type returns box', () => {
    expect(make().pointerType).toBe("box");
  });

  test('same type returns true for another box', () => {
    expect(make().sameType(make())).toBeTruthy();
  });

  test('same type returns false for a span', () => {
    expect(make().sameType(spanTesting.makeSpan())).toBeFalsy();
  });

  test('length is always 1', () => {
    expect(Box(0, 0, 1, 1).length).toBe(1);
    expect(Box(0, 0, 2, 2).length).toBe(1);
    expect(Box(4, 14, 100, 27).length).toBe(1);
  });

  test('nextX returns the x position exactly to the right after the end of the box', () => {
    expect(make({x: 5, width: 100}).nextX).toBe(105);
  });

  test('nextY returns the y position exactly below the bottom of the box', () => {
    expect(make({y: 10, height: 50}).nextY).toBe(60);
  });

  test('rightEdge returns the x position of the rightmost point within the box', () => {
    expect(make({x: 5, width: 100}).rightEdge).toBe(104);
  });

  test('bottonEdge returns the y position of the lowest point within the box', () => {
    expect(make({y: 10, height: 50}).bottomEdge).toBe(59);
  });
  
  test('equalOrigin returns true if the origins are the same', () => {
    expect(Box('origin1', 10, 20, 30, 40).equalOrigin(Box('origin1', 15, 25, 35, 45)));
  });

  test('equalOrigin returns false if the origins are different', () => {
    expect(Box('origin1', 10, 20, 30, 40).equalOrigin(Box('origin2', 10, 20, 30, 40)));
  });
});

describe('abutsHorizontally', () => {
  it('returns true when the nextX position of the 1st box is equal to the x of the 2nd and other properties (ignoring width) are equal', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX, width: 1000 });
    expect(b1.abutsHorizontally(b2)).toBeTruthy();
  });

  it('returns false if the boxes have different origins', () => {
    let b1 = make();
    let b2 = b1.clone({ origin: "something else", x: b1.nextX, width: 1000 });
    expect(b1.abutsHorizontally(b2)).toBeFalsy();
  });

  it('returns false if the boxes have different y positions', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX, width: 1000, y: b1.y + 1 });
    expect(b1.abutsHorizontally(b2)).toBeFalsy();
  });

  it('returns false if the boxes have different heights', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX, width: 1000, height: b1.height + 1 });
    expect(b1.abutsHorizontally(b2)).toBeFalsy();
  });

  it('returns false if the boxes overlap on the x axis', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.rightEdge, width: 1000 });
    expect(b1.abutsHorizontally(b2)).toBeFalsy();
  });

  it('returns false if they abut the wrong way round', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX, width: 1000 });
    expect(b2.abutsHorizontally(b1)).toBeFalsy();
  });

  it('returns false if the boxes have a gap between them on the x axis', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.nextX + 1, width: 1000 });
    expect(b1.abutsHorizontally(b2)).toBeFalsy();
  });
});

describe('abutsVertically', () => {
  it('returns true when the nextY position of the 1st box is equal to the y of the 2nd and other properties (ignoring height) are equal', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.nextY, height: 1000 });
    expect(b1.abutsVertically(b2)).toBeTruthy();
  });

  it('returns false if the boxes have different origins', () => {
    let b1 = make();
    let b2 = b1.clone({ origin: "something else", y: b1.nextY });
    expect(b1.abutsVertically(b2)).toBeFalsy();
  });

  it('returns false if the boxes have different y positions', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.nextY, x: b1.x + 1 });
    expect(b1.abutsVertically(b2)).toBeFalsy();
  });

  it('returns false if the boxes have different widths', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.nextY, width: b1.width + 1 });
    expect(b1.abutsVertically(b2)).toBeFalsy();
  });

  it('returns false if the boxes overlap on the y axis', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.bottomEdge });
    expect(b1.abutsVertically(b2)).toBeFalsy();
  });

  it('returns false if they abut the wrong way round', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.nextY });
    expect(b2.abutsVertically(b1)).toBeFalsy();
  });

  it('returns false if the boxes have a gap between them on the y axis', () => {
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
  it('returns an identical box if the argument is contained in this', () => {
    let b1 = Box("o", 10, 10, 20, 20);
    let b2 = Box ("o", 11, 11, 10, 10);
    expect(b1.merge(b2)).toEqualBox(b1);
  });

  it('returns a box identical to the argument if this is contained in the argument', () => {
    let b1 = Box("o", 10, 10, 20, 20);
    let b2 = Box ("o", 11, 11, 10, 10);
    expect(b2.merge(b1)).toEqualBox(b1);
  });

  it('returns a box identical to the original if they are both equal', () => {
    let b1 = Box("o", 10, 10, 20, 20);
    let b2 = Box("o", 10, 10, 20, 20);
    expect(b1.merge(b2)).toEqualBox(b1);
  });

  it('uses the origin from the boxes', () => {
    let b1 = Box("original", 10, 10, 20, 20);
    let b2 = Box("original", 10, 10, 20, 20);
    expect(b1.merge(b2).origin).toEqualBox("original");
  });

  describe('when they abut horizontally', () => { 
    it('returns a box encompassing both boxes if this is to the left of that', () => {
      let b1 = Box("c", 10, 10, 20, 20);
      let b2 = Box("c", 11, 10, 30, 20);
      expect(b1.merge(b2)).toEqualBox(Box("c", 10, 10, 31, 20));
    });
  
    it('returns a box encompassing both boxes if that is to the left of this', () => {
      let b1 = Box("d", 10, 10, 20, 20);
      let b2 = Box("d", 11, 10, 30, 20);
      expect(b2.merge(b1)).toEqualBox(Box("d", 10, 10, 31, 20));
    });
  });

  describe('when they abut vertically', () => { 
    it('returns a box encompassing both boxes if this is to the left of that', () => {
      let b1 = Box("e", 10, 10, 20, 20);
      let b2 = Box("e", 10, 11, 20, 30);
      expect(b1.merge(b2)).toEqualBox(Box("e", 10, 10, 20, 31));
    });
  
    it('returns a box encompassing both boxes if that is to the left of this', () => {
      let b1 = Box("f", 10, 10, 20, 20);
      let b2 = Box("f", 10, 11, 20, 30);
      expect(b2.merge(b1)).toEqualBox(Box("f", 10, 10, 20, 31));
    });
  });
});

describe('boxCrop', () => {
  it('returns an identical box if whole box is selected', () => {
    let b = make();
    expect(b.boxCrop(0, 0, b.width, b.height)).toEqualBox(b);
  });

  it('removes leftmost elements if xAdjust is greater than 0', () => {
    let b = make();
    expect(b.boxCrop(2, 0, b.width, b.height)).toEqualBox(b.clone({x: b.x + 2, width: b.width - 2}));
  });

  it('removes topmost elements if yAdjust is greater than 0', () => {
    let b = make();
    expect(b.boxCrop(0, 2, b.width, b.height)).toEqualBox(b.clone({y: b.y + 2, height: b.height - 2}));
  });

  it('removes rightmost elements if width is less than the box width', () => {
    let b = make();
    expect(b.boxCrop(0, 0, b.width - 2, b.height)).toEqualBox(b.clone({width: b.width - 2}));
  });

  it('removes bottommost elements if height is less than the box height', () => {
    let b = make();
    expect(b.boxCrop(0, 0, b.width, b.height - 2)).toEqualBox(b.clone({height: b.height - 2}));
  });

  it('always returns a box of the given width, even when leftmost elements are removed, so long as the requested width is shorter or equal to the original', () => {
    let b = make();
    expect(b.boxCrop(1, 0, b.width - 2, b.height).width).toBe(b.width - 2);
  });

  it('always returns a box of the given height, even when leftmost elements are removed, so long as the requested height is shorter or equal to the original', () => {
    let b = make();
    expect(b.boxCrop(1, 0, b.width, b.height - 2).height).toBe(b.height - 2);
  });

  it('removes leftmost and rightmost elements if a narrow box is requested', () => {
    let b = make();
    expect(b.boxCrop(1, 0, b.width - 2, b.height)).toEqualBox(b.clone({x: b.x + 1, width: b.width - 2}));
  });

  it('removes topmost and bottommost elements if a short box is requested', () => {
    let b = make();
    expect(b.boxCrop(0, 1, b.width, b.height - 2)).toEqualBox(b.clone({y: b.y + 1, height: b.height - 2}));
  });

  it('removes no rightmost or bottommost elements if width and height are not passed', () => {
    let b = make();
    expect(b.boxCrop(1, 1)).toEqualBox(b.clone({x: b.x + 1, y: b.y + 1, width: b.width - 1, height: b.height - 1}));
  });

  it('removes no rightmost or bottommost elements if width or height are greater than the box dimensions', () => {
    let b = make();
    expect(b.boxCrop(1, 1, b.width + 1, b.height)).toEqualBox(b.clone({x: b.x + 1, y: b.y + 1, width: b.width - 1, height: b.height -1}));
  });

  it('treats negative xAdjust or yAdjust as equivalent to 0', () => {
    let b = make();
    expect(b.boxCrop(-1, -1, b.width - 1, b.height - 1)).toEqualBox(b.boxCrop(0, 0, b.width - 1, b.height - 1));
  });
});

describe('clipSource', () => {
  it('returns a function', () => {
    expect(typeof make().clipSource()).toBe('function');
  });

  it('returns the box on first call', () => {
    let b = make();
    expect(b.clipSource()()).toEqualBox(b);
  });

  it('has 0 position after first call', () => {
    let b = make();
    let iterator = b.clipSource();

    iterator();

    expect(iterator.position()).toBe(0);
  });

  it('returns undefined on second call', () => {
    let b = make();
    let source = b.clipSource();
    source();
    expect(source()).toBeUndefined();
  });

  describe('clipSource.forEach', () => {
    it('is present on the iterator', () => {
      expect(make().clipSource()).toHaveProperty("forEach");
    });

    it('calls the callback exactly once with the box and zero as arguments', () => {
      let b = make();
      const mockCallback = jest.fn((x, y) => x+y);

      b.clipSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toBe(1);
      expect(mockCallback.mock.calls[0][0]).toBe(b);
      expect(mockCallback.mock.calls[0][1]).toBe(0);
    });

    it('does not call the callback if the box has already been iterated', () => {
      let source = make().clipSource();
      const mockCallback = jest.fn(x => x);

      source();
      source.forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toBe(0);
    });
  })
});

describe('leafData', () => {
  it('has the typ, ori, x, y, wd and ht properties when originalContext is missing', () => {
    expect(Box("a", 101, 505, 22, 33).leafData()).toEqual({
      typ: "box",
      ori: "a",
      x: 101,
      y: 505,
      wd: 22,
      ht: 33
    });
  });

  it('has the typ, ori, x, y, wd, ht and ctx properties when originalContext is present', () => {
    expect(Box("a", 101, 505, 22, 33, EdlPointer("foo")).leafData()).toEqual({
      typ: "box",
      ori: "a",
      x: 101,
      y: 505,
      wd: 22,
      ht: 33,
      ctx: { typ: "edl", name: "foo" }
    });
  });
});

test('leafDataToBox is inverse of leafData when originalContext missing', () => {
  let b = Box("orig", 1, 2, 101, 202);
  expect(leafDataToBox(b.leafData())).toEqualBox(b);
});

test('leafDataToBox is inverse of leafData when originalContext present', () => {
  let b = Box("orig", 1, 2, 101, 202, EdlPointer("foo"));
  expect(leafDataToBox(b.leafData())).toEqualBox(b);
});

describe('overlaps', () => {
  it('returns true when the two boxes are the same box', () => {
    let b1 = make();

    expect(b1.overlaps(b1)).toBeTruthy();
  });

  it('returns true when the two boxes are identical', () => {
    let b1 = make(), b2 = make();

    expect(b1.overlaps(b2)).toBeTruthy();
  });

  it('returns true if one box is contained in the other', () => {
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
  it('is false if the point is to the left of the box', () => {
    let box = make({x: 10});
    expect(box.contains(9, box.y)).toBeFalsy();
  });

  it('is false if the point is to the right of the box', () => {
    let box = make({x: 10, width: 10});
    expect(box.contains(20, box.y)).toBeFalsy();
  });

  it('is true if the point is at the left edge of the box', () => {
    let box = make();
    expect(box.contains(box.x, box.y)).toBeTruthy();
  });

  it('is true if the point is at the right edge of the box', () => {
    let box = make();
    expect(box.contains(box.rightEdge, box.y)).toBeTruthy();
  });

  it('is true if the point is within the box', () => {
    let box = make({x: 10, width: 10});
    expect(box.contains(15, box.y)).toBeTruthy();
  });

  it('is true if the box is one point wide and the point equals it', () => {
    let box = make({width:1});
    expect(box.contains(box.x, box.y)).toBeTruthy();
  });

  it('is false if the point is above the box', () => {
    let box = make({y: 10});
    expect(box.contains(box.x, 9)).toBeFalsy();
  });

  it('is false if the point is below the box', () => {
    let box = make({y: 10, height: 10});
    expect(box.contains(box.x, 20)).toBeFalsy();
  });

  it('is true if the point is at the top edge of the box', () => {
    let box = make();
    expect(box.contains(box.x, box.y)).toBeTruthy();
  });

  it('is true if the point is at the bottom edge of the box', () => {
    let box = make();
    expect(box.contains(box.x, box.bottomEdge)).toBeTruthy();
  });

  it('is true if the point is within the box', () => {
    let box = make({y: 10, height: 10});
    expect(box.contains(box.x, 15)).toBeTruthy();
  });

  it('is true if the box is one point high and the point equals it', () => {
    let box = make({height:1});
    expect(box.contains(box.x, box.y)).toBeTruthy();
  });
});

describe('engulfs', () => {
  it('returns true if the boxes are equal', () => {
    let box = make();
    expect(box.engulfs(box.clone())).toBeTruthy();
  });

  it('returns true if one box contains the other', () => {
    let box = make({x: 10, y: 12, width: 5, height: 15});
    expect(box.engulfs(box.clone({x: 11, y: 13, width: 3, height: 13}))).toBeTruthy();
  });

  it('returns false if the boxes have different origins', () => {
    let box = make();
    expect(box.engulfs(box.clone({origin: "something else"}))).toBeFalsy();
  });

  it('returns false if that starts to the left of this', () => {
    let box = make();
    expect(box.engulfs(box.clone({x: box.x - 1}))).toBeFalsy();
  });

  it('returns false if that ends after this', () => {
    let box = make();
    expect(box.engulfs(box.clone({width: box.width + 1}))).toBeFalsy();
  });

  it('returns false if that starts above this', () => {
    let box = make();
    expect(box.engulfs(box.clone({y: box.y - 1}))).toBeFalsy();
  });

  it('returns false if that ends below this', () => {
    let box = make();
    expect(box.engulfs(box.clone({height: box.height + 1}))).toBeFalsy();
  });

  it('returns false if they do not overlap at all', () => {
    let box = make({x: 10, y: 12, width: 5, height: 15});
    expect(box.engulfs(box.clone({x: 100, y: 120, width: 100, height: 20}))).toBeFalsy();
  });
});

describe('intersect', () => {
  it('returns [false, undefined] if the boxes do not overlap', () => {
    let b1 = make();
    let b2 = b1.clone({x: b1.nextX});

    expect(b1.intersect(b2)).toEqual([false, undefined]);
  });

  it('returns [true, result] if the boxes overlap', () => {
    let b1 = make();
    let b2 = b1.clone({x: b1.nextX - 1});

    expect(b1.intersect(b2)[0]).toEqual(true);
  });

  it('returns the original box if the second is equal to it', () => {
    let b1 = make();
    let b2 = b1.clone();

    expect(b1.intersect(b2)[1]).toEqual(b1);
  });

  it('returns the original dimensions if the second box encompasses it', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.x - 1, y: b1.y - 1, width: b1.width + 2, height: b1.height + 2 });

    expect(b1.intersect(b2)[1]).toEqual(b1);
  });

  it('returns the dimensions of the second box if we encompass it', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.x - 1, y: b1.y - 1, width: b1.width + 2, height: b1.height + 2 });

    expect(b2.intersect(b1)[1]).toEqual(b1);
  });

  it('has the x of the other box if that is later', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.x + 1});

    expect(b1.intersect(b2)[1].x).toBe(b2.x);
  });

  it('has the y of the other box if that is later', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.y + 1});

    expect(b1.intersect(b2)[1].y).toBe(b2.y);
  });

  it('has the x of this box if that is later', () => {
    let b1 = make();
    let b2 = b1.clone({ x: b1.x + 1});

    expect(b2.intersect(b1)[1].x).toBe(b2.x);
  });

  it('has the y of this box if that is later', () => {
    let b1 = make();
    let b2 = b1.clone({ y: b1.y + 1});

    expect(b2.intersect(b1)[1].y).toBe(b2.y);
  });

  it('has the nextX of the other box if that is lesser', () => {
    let b1 = make();
    let b2 = b1.clone({ width: b1.width - 1});

    expect(b1.intersect(b2)[1].nextX).toBe(b2.nextX);
  });

  it('has the nextY of the other box if that is lesser', () => {
    let b1 = make();
    let b2 = b1.clone({ height: b1.height - 1});

    expect(b1.intersect(b2)[1].nextY).toBe(b2.nextY);
  });

  it('has the nextX of the other box if that is greater', () => {
    let b1 = make();
    let b2 = b1.clone({ width: b1.width - 1});

    expect(b2.intersect(b1)[1].nextX).toBe(b2.nextX);
  });

  it('has the nextY of the other box if that is greater', () => {
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
  it('returns [false, undefined] if the boxes do not overlap', () => {
    let b1 = make();
    let b2 = b1.clone({x: b1.nextX});

    expect(b1.clipPart(makePart(b2))).toEqual([false, undefined]);
  });

  it('returns [true, result] if the boxes overlap', () => {
    let b1 = make();
    let b2 = b1.clone({x: b1.nextX - 1});

    expect(b1.clipPart(makePart(b2))[0]).toEqual(true);
  });

  it('returns the intersection of the two boxes', () => {
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

