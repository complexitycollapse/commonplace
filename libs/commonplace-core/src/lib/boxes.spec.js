import { describe, expect, it, test, jest } from '@jest/globals';
import { box } from "./boxes";
import { toEqualBox } from './edits.test-helpers';

expect.extend({
  toEqualBox
});

function make({origin = "origin", x = 10, y = 11, width = 20, height = 25} = {}) {
  return box(origin, x, y, width, height);
}

describe('box', () => {
  it('has origin, x, y, width and height', () => {
    let actual = box('origin', 1, 100, 200, 250);
    expect(actual.origin).toEqual('origin');
    expect(actual.x).toEqual(1);
    expect(actual.y).toEqual(100);
    expect(actual.width).toEqual(200);
    expect(actual.height).toEqual(250);
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
    expect(b.clone({ origin: 'other' })).toEqualBox(box('other', b.x, b.y, b.width, b.height));
  });

  it('replaces only x when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ x: 99 })).toEqualBox(box(b.origin, 99, b.y, b.width, b.height));
  });

  it('replaces only y when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ y: 99 })).toEqualBox(box(b.origin, b.x, 99, b.width, b.height));
  });

  it('replaces only width when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ width: 99 })).toEqualBox(box(b.origin, b.x, b.y, 99, b.height));
  });

  it('replaces only height when that is passed as a parameter', () => {
    let b = make();
    expect(make().clone({ height: 99 })).toEqualBox(box(b.origin, b.x, b.y, b.width, 99));
  });
});

describe('basic box functions', () => {
  test('edit type returns box', () => {
    expect(make().editType).toEqual("box");
  });

  test('length is always 1', () => {
    expect(box(0, 0, 1, 1).length).toEqual(1);
    expect(box(0, 0, 2, 2).length).toEqual(1);
    expect(box(4, 14, 100, 27).length).toEqual(1);
  });

  test('nextX returns the x position exactly to the right after the end of the box', () => {
    expect(make({x: 5, width: 100}).nextX).toEqual(105);
  });

  test('nextY returns the y position exactly below the bottom of the box', () => {
    expect(make({y: 5, height: 100}).nextY).toEqual(105);
  });
  
  test('equalOrigin returns true if the origins are the same', () => {
    expect(box('origin1', 10, 20, 30, 40).equalOrigin(box('origin1', 15, 25, 35, 45)));
  });

  test('equalOrigin returns false if the origins are different', () => {
    expect(box('origin1', 10, 20, 30, 40).equalOrigin(box('origin2', 10, 20, 30, 40)));
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
    let b2 = b1.clone({ x: b1.nextX - 1, width: 1000 });
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
    let b2 = b1.clone({ y: b1.nextY - 1 });
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
    let b2 = b1.clone({ x: b1.nextX - 1, y: b1.nextY - 1 });
    expect(b1.abuts(b2)).toBeFalsy();
  });
});

describe('merge', () => {
  it('returns an identical box if the argument is contained in this', () => {
    let b1 = box("o", 10, 10, 20, 20);
    let b2 = box ("o", 11, 11, 10, 10);
    expect(b1.merge(b2)).toEqualBox(b1);
  });

  it('returns a box identical to the argument if this is contained in the argument', () => {
    let b1 = box("o", 10, 10, 20, 20);
    let b2 = box ("o", 11, 11, 10, 10);
    expect(b2.merge(b1)).toEqualBox(b1);
  });

  it('returns a box identical to the original if they are both equal', () => {
    let b1 = box("o", 10, 10, 20, 20);
    let b2 = box("o", 10, 10, 20, 20);
    expect(b1.merge(b2)).toEqualBox(b1);
  });

  it('uses the origin from the boxes', () => {
    let b1 = box("original", 10, 10, 20, 20);
    let b2 = box("original", 10, 10, 20, 20);
    expect(b1.merge(b2).origin).toEqualBox("original");
  });

  describe('when they abut horizontally', () => { 
    it('returns a box encompassing both boxes if this is to the left of that', () => {
      let b1 = box("c", 10, 10, 20, 20);
      let b2 = box("c", 11, 10, 30, 20);
      expect(b1.merge(b2)).toEqualBox(box("c", 10, 10, 31, 20));
    });
  
    it('returns a box encompassing both boxes if that is to the left of this', () => {
      let b1 = box("d", 10, 10, 20, 20);
      let b2 = box("d", 11, 10, 30, 20);
      expect(b2.merge(b1)).toEqualBox(box("d", 10, 10, 31, 20));
    });
  });

  describe('when they abut vertically', () => { 
    it('returns a box encompassing both boxes if this is to the left of that', () => {
      let b1 = box("e", 10, 10, 20, 20);
      let b2 = box("e", 10, 11, 20, 30);
      expect(b1.merge(b2)).toEqualBox(box("e", 10, 10, 20, 31));
    });
  
    it('returns a box encompassing both boxes if that is to the left of this', () => {
      let b1 = box("f", 10, 10, 20, 20);
      let b2 = box("f", 10, 11, 20, 30);
      expect(b2.merge(b1)).toEqualBox(box("f", 10, 10, 20, 31));
    });
  });
});

describe('crop', () => {
  it('returns an identical box if whole box is selected', () => {
    let b = make();
    expect(b.crop(0, 0, b.width, b.height)).toEqualBox(b);
  });

  it('removes leftmost elements if xAdjust is greater than 0', () => {
    let b = make();
    expect(b.crop(2, 0, b.width, b.height)).toEqualBox(b.clone({x: b.x + 2, width: b.width - 2}));
  });

  it('removes topmost elements if yAdjust is greater than 0', () => {
    let b = make();
    expect(b.crop(0, 2, b.width, b.height)).toEqualBox(b.clone({y: b.y + 2, height: b.height - 2}));
  });

  it('removes rightmost elements if width is less than the box width', () => {
    let b = make();
    expect(b.crop(0, 0, b.width - 2, b.height)).toEqualBox(b.clone({width: b.width - 2}));
  });

  it('removes bottommost elements if height is less than the box height', () => {
    let b = make();
    expect(b.crop(0, 0, b.width, b.height - 2)).toEqualBox(b.clone({height: b.height - 2}));
  });

  it('always returns a span of the given width, even when leftmost elements are removed, so long as the requested width is shorter or equal to the original', () => {
    let b = make();
    expect(b.crop(1, 0, b.width - 2, b.height).width).toEqual(b.width - 2);
  });

  it('always returns a span of the given height, even when leftmost elements are removed, so long as the requested height is shorter or equal to the original', () => {
    let b = make();
    expect(b.crop(1, 0, b.width, b.height - 2).height).toEqual(b.height - 2);
  });

  it('removes leftmost and rightmost elements if a narrow box is requested', () => {
    let b = make();
    expect(b.crop(1, 0, b.width - 2, b.height)).toEqualBox(b.clone({x: b.x + 1, width: b.width - 2}));
  });

  it('removes topmost and bottommost elements if a short box is requested', () => {
    let b = make();
    expect(b.crop(0, 1, b.width, b.height - 2)).toEqualBox(b.clone({y: b.y + 1, height: b.height - 2}));
  });

  it('removes no rightmost or bottommost elements if width and height are not passed', () => {
    let b = make();
    expect(b.crop(1, 1)).toEqualBox(b.clone({x: b.x + 1, y: b.y + 1, width: b.width - 1, height: b.height - 1}));
  });

  it('removes no rightmost or bottommost elements if width or height are greater than the box dimensions', () => {
    let b = make();
    expect(b.crop(1, 1, b.width + 1, b.height)).toEqualBox(b.clone({x: b.x + 1, y: b.y + 1, width: b.width - 1, height: b.height -1}));
  });

  it('treats negative xAdjust or yAdjust as equivalent to 0', () => {
    let b = make();
    expect(b.crop(-1, -1, b.width - 1, b.height - 1)).toEqualBox(b.crop(0, 0, b.width - 1, b.height - 1));
  });
});

describe('editSource', () => {
  it('returns a function', () => {
    expect(typeof make().editSource()).toEqual('function');
  });

  it('returns the box on first call', () => {
    let b = make();
    expect(b.editSource()()).toEqualBox(b);
  });

  it('has 0 position after first call', () => {
    let b = make();
    let iterator = b.editSource();

    iterator();

    expect(iterator.position()).toEqual(0);
  });

  it('returns undefined on second call', () => {
    let b = make();
    let source = b.editSource();
    source();
    expect(source()).toBeUndefined();
  });

  describe('editSource.forEach', () => {
    it('is present on the iterator', () => {
      expect(make().editSource()).toHaveProperty("forEach");
    });

    it('calls the callback exactly once with the box and zero as arguments', () => {
      let b = make();
      const mockCallback = jest.fn((x, y) => x+y);

      b.editSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(1);
      expect(mockCallback.mock.calls[0][0]).toEqual(b);
      expect(mockCallback.mock.calls[0][1]).toEqual(0);
    });

    it('does not call the callback if the box has already been iterated', () => {
      let source = make().editSource();
      const mockCallback = jest.fn(x => x);

      source();
      source.forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(0);
    });
  })
});
