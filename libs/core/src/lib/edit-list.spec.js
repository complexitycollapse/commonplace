import { describe, expect, it, jest, test} from '@jest/globals';
import { EditList, leafDataToEditList } from './edit-list';
import { Span, spanTesting } from './span';
import { Box, boxTesting } from './box';
import { toEqualEdit, hasEdits } from './edit.test-helpers';

expect.extend({
  toEqualEdit,
  hasEdits
});

let makeSpan = spanTesting.makeSpan, makeBox = boxTesting.makeBox;
let makeSpans = spanTesting.makeSpans;

function sumLengths(edits) {
  return edits.reduce((a, s) => a + s.length, 0);
}

describe('editList', () => {
  it('sets the edits to the given initial spans if they do not abut', () => {
    let s1 = Span("a", 1, 2), s2 = Span("b", 3, 4);
    expect(EditList(s1, s2)).hasEdits(s1, s2);
  });

  it('sets the edits to the given initial boxes if they do not abut', () => {
    let b1 = Box("a", 1, 2, 3, 4), b2 = Box("b", 3, 4, 5, 6);
    expect(EditList(b1, b2)).hasEdits(b1, b2);
  });

  it('merges spans that abut', () => {
    let s1 = Span("a", 1, 2), s2 = Span("a", s1.next, 4);
    expect(EditList(s1, s2)).hasEdits(Span("a", 1, 6));
  });

  it('merges boxes that abut', () => {
    let b1 = Box("a", 1, 2, 10, 10), b2 = Box("a", b1.nextX, 2, 10, 10);
    expect(EditList(b1, b2)).hasEdits(Box("a", 1, 2, 20, 10));
  });

  it('takes all edits from a EditList', () => {
    let e1 = Span("a", 1, 2), e2 = Box("a", 2, 4, 10, 10);
    let el = EditList(e1, e2);
    expect(EditList(el)).hasEdits(e1, e2);
  });

  it('merges middle spans from EditLists if they abut', () => {
    let s1a = Span("a", 0, 5), s1b = Span("a", 1, 5), s1c = Span("a", 10, 5);
    let s2a = Span("a", 15, 20), s2b = Span("a", 2, 10), s2c = Span("a", 3, 10);
    let el1 = EditList(s1a, s1b, s1c), el2 = EditList(s2a, s2b, s2c);

    expect(EditList(el1, el2)).hasEdits(s1a, s1b, s1c.merge(s2a), s2b, s2c);
  });

  it('merges middle boxes from EditLists if they abut', () => {
    let b1a = Box("a", 0, 0, 5, 5), b1b = Box("a", 1, 1, 5, 5), b1c = Box("a", 10, 5, 5, 20);
    let b2a = Box("a", 15, 5, 20, 20), b2b = Box("a", 2, 2, 10, 10), b2c = Box("a", 3, 3, 10, 10);
    let el1 = EditList(b1a, b1b, b1c), el2 = EditList(b2a, b2b, b2c);

    expect(EditList(el1, el2)).hasEdits(b1a, b1b, b1c.merge(b2a), b2b, b2c);
  });

  it('merges all spans passed if they abut', () => {
    let s1a = Span("a", 0, 5), s1b = Span("a", 5, 5), s1c = Span("a", 10, 5);
    let s2a = Span("a", 15, 20), s2b = Span("a", 35, 10), s2c = Span("a", 45, 10);
    let el1 = EditList(s1a, s1b, s1c), el2 = EditList(s2a, s2b, s2c);

    expect(EditList(el1, el2)).hasEdits(Span("a", 0, 55));
  });

  it('merges all boxes passed if they abut', () => {
    let b1a = Box("a", 0, 0, 5, 10), b1b = Box("a", 5, 0, 5, 10), b1c = Box("a", 10, 0, 5, 10);
    let b2a = Box("a", 15, 0, 20, 10), b2b = Box("a", 35, 0, 10, 10), b2c = Box("a", 45, 0, 10, 10);
    let el1 = EditList(b1a, b1b, b1c), el2 = EditList(b2a, b2b, b2c);

    expect(EditList(el1, el2)).hasEdits(Box("a", 0, 0, 55, 10));
  });

  it('ignores empty EditLists', () => {
    let s1 = Span("a", 1, 2), s2 = Span("a", 3, 4);

    expect(EditList(EditList(), s1, EditList(), s2, EditList())).hasEdits(s1.merge(s2));
  });
});

describe('concLength', () => {
  it('returns 0 for empty set', () => {
    expect(EditList().concLength()).toBe(0);
  });

  it('returns the length of a span when it has one span', () => {
    let el = EditList();
    el.append(makeSpan({length: 100}));
    expect(el.concLength()).toBe(100);
  });

  it('returns the length of a box when it has one box', () => {
    let el = EditList();
    el.append(Box("a", 10, 20, 30, 40));
    expect(el.concLength()).toBe(1);
  });

  it('returns the sum of the lengths of edits it contains', () => {
    let el = EditList();
    el.append(makeSpan({length: 100}));
    el.append(makeBox());
    el.append(makeSpan({length: 3}));
    expect(el.concLength()).toBe(104);
  });
});

describe('editSource', () => {
  it('returns undefined if the array is empty', () => {
    let iterator = EditList().editSource();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
  });

  it('returns the edits in sequence', () => {
    let e1 = Span("a", 1, 10), e2 = Box("b", 2, 2, 10, 10), e3 = Span("c", 30, 300);
    let el = EditList(e1, e2, e3);
    let iterator = el.editSource();

    expect(iterator()).toEqualEdit(e1);
    expect(iterator()).toEqualEdit(e2);
    expect(iterator()).toEqualEdit(e3);
    expect(iterator()).toBeUndefined();
  });

  describe('editSource.foreach', () => {
    it('is present on the iterator', () => {
      expect(EditList().editSource()).toHaveProperty("forEach");
    });

    it('never calls the callback if the EditList is empty', () => {
      const mockCallback = jest.fn(x => x);

      EditList().editSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toBe(0);
    });

    it('calls the callback with all the present edits in order', () => {
      const mockCallback = jest.fn(x => x);
      let e1 = Span("a", 1, 10), e2 = Box("b", 2, 2, 10, 10), e3 = Span("c", 30, 300);
      let el = EditList(e1, e2, e3);

      el.editSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toBe(3);
      expect(mockCallback.mock.calls[0][0]).toEqualEdit(e1);
      expect(mockCallback.mock.calls[1][0]).toEqualEdit(e2);
      expect(mockCallback.mock.calls[2][0]).toEqualEdit(e3);
    });

    it('calls the callback with the sum of the lengths of the previous edits', () => {
      const mockCallback = jest.fn((x, y) => x);
      let e1 = Span("a", 1, 20), e2 = Box("b", 2, 2, 10, 10), e3 = Span("c", 30, 300);
      let el = EditList(e1, e2, e3);

      el.editSource().forEach(mockCallback);

      expect(mockCallback.mock.calls[0][1]).toBe(0);
      expect(mockCallback.mock.calls[1][1]).toBe(20);
      expect(mockCallback.mock.calls[2][1]).toBe(21);
    });

    it('continues from where the iterator left off', () => {
      const mockCallback = jest.fn(x => x);
      let e1 = Span("a", 1, 2), e2 = Box("b", 2, 2, 10, 10), e3 = Span("c", 30, 300);
      let el = EditList(e1, e2, e3);
      let iterator = el.editSource();

      iterator();
      iterator.forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toBe(2);
      expect(mockCallback.mock.calls[0][0]).toEqualEdit(e2);
      expect(mockCallback.mock.calls[0][1]).toBe(2);
      expect(mockCallback.mock.calls[1][0]).toEqualEdit(e3);
      expect(mockCallback.mock.calls[1][1]).toBe(3);
    });
  });
});

describe('range', () => {
  it('has no edits if the EditList was empty', () => {
    expect(EditList().range(0, 100)).hasEdits();
  });

  it('returns all edits if the start and length include them all', () => {
    let edits = makeSpans(5);
    edits.push(makeBox());
    expect(EditList(...edits).range(0, sumLengths(edits))).hasEdits(...edits);
  });

  it('returns only the first edits if the later ones are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(0, -2);
    expect(EditList(...spans).range(0, sumLengths(subset))).hasEdits(...subset);
  });

  it('returns the first edits when the start point is negative', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(0, -2);
    expect(EditList(...spans).range(-1, sumLengths(subset))).hasEdits(...subset);
  });

  it('returns only the last edits  if the earlier ones are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(2);
    let start = spans[0].length + spans[1].length;
    expect(EditList(...spans).range(start, sumLengths(subset))).hasEdits(...subset);
  });

  it('returns the last edits if the length is excessive', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(2);
    let start = spans[0].length + spans[1].length;
    expect(EditList(...spans).range(start, sumLengths(subset) + 1)).hasEdits(...subset);
  });

  it('returns only the middle edits if the ends are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(1, -1);
    expect(EditList(...spans).range(spans[0].length, sumLengths(subset))).hasEdits(...subset);
  });

  it('splits a span if the start point lies within it', () => {
    let spans = makeSpans(5);
    let subset = [spans[1].crop(2), ...spans.slice(2)];
    expect(EditList(...spans).range(spans[0].length + 2, sumLengths(subset))).hasEdits(...subset);
  });

  it('splits a span if the end point lies within it', () => {
    let spans = makeSpans(5);
    let subset = [...spans.slice(0, 3), spans[3].crop(0, 3)];
    let length = spans[0].length + spans[1].length + spans[2].length + 3;
    expect(EditList(...spans).range(0, length)).hasEdits(...subset);
  });

  it('splits a span if the start and end points lie within it', () => {
    let spans = makeSpans(5);
    let remaining = spans[2].crop(1, spans[2].length - 2);
    let start = spans[0].length + spans[1].length + 1;
    expect(EditList(...spans).range(start, spans[2].length - 2)).hasEdits(remaining);
  });

  it('returns no spans if the start is greater than or equal to the span length', () => {
    let spans = makeSpans(5);
    expect(EditList(...spans).range(sumLengths(spans), 10)).hasEdits();
  });

  it('returns no spans if the length is 0', () => {
    let spans = makeSpans(5);
    expect(EditList(...spans).range(11, 0)).hasEdits();
  });
});

describe('leafData', () => {
  it('returns an empty array if there are no edits', () => {
    expect(EditList().leafData()).toHaveLength(0);
  });

  it('returns span serializer data if it contains a span', () => {
    expect(EditList(Span("a", 101, 505)).leafData()[0]).toEqual({
      typ: "span",
      ori: "a",
      st: 101,
      ln: 505
    });
  });

  it('returns box serializer data if it contains a box', () => {
    expect(EditList(Box("a", 101, 505, 22, 33)).leafData()[0]).toEqual({
      typ: "box",
      ori: "a",
      x: 101,
      y: 505,
      wd: 22,
      hg: 33
    });
  });
});

test('leafDataToEditList is inverse of leafData', () => {
  let edits = [Span("orig1", 12, 34), Box("orig2", 123, 234, 345, 456)];
  let el = EditList(...edits);
  expect(leafDataToEditList(el.leafData())).hasEdits(...edits);
});