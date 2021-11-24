import { describe, expect, it, jest} from '@jest/globals';
import { editList } from './edit-lists';
import { span } from './spans';
import { box } from './boxes';
import { toEqualEdit, makeSpans, hasEdits, makeSpan, makeBox } from './edits.test-helpers';

expect.extend({
  toEqualEdit,
  hasEdits
});

function sumLengths(edits) {
  return edits.reduce((a, s) => a + s.length, 0);
}

describe('editList', () => {
  it('sets the edits to the given initial spans if they do not abut', () => {
    let s1 = span("a", 1, 2), s2 = span("b", 3, 4);
    expect(editList(s1, s2)).hasEdits(s1, s2);
  });

  it('sets the edits to the given initial boxes if they do not abut', () => {
    let b1 = box("a", 1, 2, 3, 4), b2 = box("b", 3, 4, 5, 6);
    expect(editList(b1, b2)).hasEdits(b1, b2);
  });

  it('merges spans that abut', () => {
    let s1 = span("a", 1, 2), s2 = span("a", s1.next, 4);
    expect(editList(s1, s2)).hasEdits(span("a", 1, 6));
  });

  it('merges boxes that abut', () => {
    let b1 = box("a", 1, 2, 10, 10), b2 = box("a", b1.nextX, 2, 10, 10);
    expect(editList(b1, b2)).hasEdits(box("a", 1, 2, 20, 10));
  });

  it('takes all edits from a EditList', () => {
    let e1 = span("a", 1, 2), e2 = box("a", 2, 4, 10, 10);
    let el = editList(e1, e2);
    expect(editList(el)).hasEdits(e1, e2);
  });

  it('merges middle spans from EditLists if they abut', () => {
    let s1a = span("a", 0, 5), s1b = span("a", 1, 5), s1c = span("a", 10, 5);
    let s2a = span("a", 15, 20), s2b = span("a", 2, 10), s2c = span("a", 3, 10);
    let el1 = editList(s1a, s1b, s1c), el2 = editList(s2a, s2b, s2c);

    expect(editList(el1, el2)).hasEdits(s1a, s1b, s1c.merge(s2a), s2b, s2c);
  });

  it('merges middle boxes from EditLists if they abut', () => {
    let b1a = box("a", 0, 0, 5, 5), b1b = box("a", 1, 1, 5, 5), b1c = box("a", 10, 5, 5, 20);
    let b2a = box("a", 15, 5, 20, 20), b2b = box("a", 2, 2, 10, 10), b2c = box("a", 3, 3, 10, 10);
    let el1 = editList(b1a, b1b, b1c), el2 = editList(b2a, b2b, b2c);

    expect(editList(el1, el2)).hasEdits(b1a, b1b, b1c.merge(b2a), b2b, b2c);
  });

  it('merges all spans passed if they abut', () => {
    let s1a = span("a", 0, 5), s1b = span("a", 5, 5), s1c = span("a", 10, 5);
    let s2a = span("a", 15, 20), s2b = span("a", 35, 10), s2c = span("a", 45, 10);
    let el1 = editList(s1a, s1b, s1c), el2 = editList(s2a, s2b, s2c);

    expect(editList(el1, el2)).hasEdits(span("a", 0, 55));
  });

  it('merges all boxes passed if they abut', () => {
    let b1a = box("a", 0, 0, 5, 10), b1b = box("a", 5, 0, 5, 10), b1c = box("a", 10, 0, 5, 10);
    let b2a = box("a", 15, 0, 20, 10), b2b = box("a", 35, 0, 10, 10), b2c = box("a", 45, 0, 10, 10);
    let el1 = editList(b1a, b1b, b1c), el2 = editList(b2a, b2b, b2c);

    expect(editList(el1, el2)).hasEdits(box("a", 0, 0, 55, 10));
  });

  it('ignores empty EditLists', () => {
    let s1 = span("a", 1, 2), s2 = span("a", 3, 4);

    expect(editList(editList(), s1, editList(), s2, editList())).hasEdits(s1.merge(s2));
  });
});

describe('concLength', () => {
  it('returns 0 for empty set', () => {
    expect(editList().concLength()).toEqual(0);
  });

  it('returns the length of a span when it has one span', () => {
    let el = editList();
    el.append(makeSpan({length: 100}));
    expect(el.concLength()).toEqual(100);
  });

  it('returns the length of a box when it has one box', () => {
    let el = editList();
    el.append(box("a", 10, 20, 30, 40));
    expect(el.concLength()).toEqual(1);
  });

  it('returns the sum of the lengths of edits it contains', () => {
    let el = editList();
    el.append(makeSpan({length: 100}));
    el.append(makeBox());
    el.append(makeSpan({length: 3}));
    expect(el.concLength()).toEqual(104);
  });
});

describe('editSource', () => {
  it('returns undefined if the array is empty', () => {
    let iterator = editList().editSource();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
  });

  it('returns the edits in sequence', () => {
    let e1 = span("a", 1, 10), e2 = box("b", 2, 2, 10, 10), e3 = span("c", 30, 300);
    let el = editList(e1, e2, e3);
    let iterator = el.editSource();

    expect(iterator()).toEqualEdit(e1);
    expect(iterator()).toEqualEdit(e2);
    expect(iterator()).toEqualEdit(e3);
    expect(iterator()).toBeUndefined();
  });

  describe('editSource.foreach', () => {
    it('is present on the iterator', () => {
      expect(editList().editSource()).toHaveProperty("forEach");
    });

    it('never calls the callback if the EditList is empty', () => {
      const mockCallback = jest.fn(x => x);

      editList().editSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(0);
    });

    it('calls the callback with all the present edits in order', () => {
      const mockCallback = jest.fn(x => x);
      let e1 = span("a", 1, 10), e2 = box("b", 2, 2, 10, 10), e3 = span("c", 30, 300);
      let el = editList(e1, e2, e3);

      el.editSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(3);
      expect(mockCallback.mock.calls[0][0]).toEqualEdit(e1);
      expect(mockCallback.mock.calls[1][0]).toEqualEdit(e2);
      expect(mockCallback.mock.calls[2][0]).toEqualEdit(e3);
    });

    it('calls the callback with the sum of the lengths of the previous edits', () => {
      const mockCallback = jest.fn((x, y) => x);
      let e1 = span("a", 1, 20), e2 = box("b", 2, 2, 10, 10), e3 = span("c", 30, 300);
      let el = editList(e1, e2, e3);

      el.editSource().forEach(mockCallback);

      expect(mockCallback.mock.calls[0][1]).toEqual(0);
      expect(mockCallback.mock.calls[1][1]).toEqual(20);
      expect(mockCallback.mock.calls[2][1]).toEqual(21);
    });

    it('continues from where the iterator left off', () => {
      const mockCallback = jest.fn(x => x);
      let e1 = span("a", 1, 2), e2 = box("b", 2, 2, 10, 10), e3 = span("c", 30, 300);
      let el = editList(e1, e2, e3);
      let iterator = el.editSource();

      iterator();
      iterator.forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(2);
      expect(mockCallback.mock.calls[0][0]).toEqualEdit(e2);
      expect(mockCallback.mock.calls[0][1]).toEqual(2);
      expect(mockCallback.mock.calls[1][0]).toEqualEdit(e3);
      expect(mockCallback.mock.calls[1][1]).toEqual(3);
    });
  });
});

describe('range', () => {
  it('has no edits if the EditList was empty', () => {
    expect(editList().range(0, 100)).hasEdits();
  });

  it('returns all edits if the start and length include them all', () => {
    let edits = makeSpans(5);
    edits.push(makeBox());
    expect(editList(...edits).range(0, sumLengths(edits))).hasEdits(...edits);
  });

  it('returns only the first edits if the later ones are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(0, -2);
    expect(editList(...spans).range(0, sumLengths(subset))).hasEdits(...subset);
  });

  it('returns the first edits when the start point is negative', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(0, -2);
    expect(editList(...spans).range(-1, sumLengths(subset))).hasEdits(...subset);
  });

  it('returns only the last edits  if the earlier ones are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(2);
    let start = spans[0].length + spans[1].length;
    expect(editList(...spans).range(start, sumLengths(subset))).hasEdits(...subset);
  });

  it('returns the last edits if the length is excessive', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(2);
    let start = spans[0].length + spans[1].length;
    expect(editList(...spans).range(start, sumLengths(subset) + 1)).hasEdits(...subset);
  });

  it('returns only the middle edits if the ends are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(1, -1);
    expect(editList(...spans).range(spans[0].length, sumLengths(subset))).hasEdits(...subset);
  });

  it('splits a span if the start point lies within it', () => {
    let spans = makeSpans(5);
    let subset = [spans[1].crop(2), ...spans.slice(2)];
    expect(editList(...spans).range(spans[0].length + 2, sumLengths(subset))).hasEdits(...subset);
  });

  it('splits a span if the end point lies within it', () => {
    let spans = makeSpans(5);
    let subset = [...spans.slice(0, 3), spans[3].crop(0, 3)];
    let length = spans[0].length + spans[1].length + spans[2].length + 3;
    expect(editList(...spans).range(0, length)).hasEdits(...subset);
  });

  it('splits a span if the start and end points lie within it', () => {
    let spans = makeSpans(5);
    let remaining = spans[2].crop(1, spans[2].length - 2);
    let start = spans[0].length + spans[1].length + 1;
    expect(editList(...spans).range(start, spans[2].length - 2)).hasEdits(remaining);
  });

  it('returns no spans if the start is greater than or equal to the span length', () => {
    let spans = makeSpans(5);
    expect(editList(...spans).range(sumLengths(spans), 10)).hasEdits();
  });

  it('returns no spans if the length is 0', () => {
    let spans = makeSpans(5);
    expect(editList(...spans).range(11, 0)).hasEdits();
  });
});
