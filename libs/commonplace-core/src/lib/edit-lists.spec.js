import { describe, expect, it, jest} from '@jest/globals';
import { editList } from './edit-lists';
import { span } from './spans';
import { toEqualSpan, makeSpans } from './edits.test-helpers';

expect.extend({
  toEqualSpan,
  hasSpans(ss, ...spans) {
    let iterator = ss.editSource();
    let i = 0;
    let failed = false;

    spans.forEach(span => {
      if (failed === false) {
        let actual = iterator();
        let singleResult = toEqualSpan(actual, span);
        if (!singleResult.pass) {
          failed = {span, i, actual};
        }
        ++i;
      }
    });

    if (failed) {
      return {
        message: () => `expected ${JSON.stringify(failed.span)} at position ${failed.i}, received ${JSON.stringify(failed.actual)}`,
        pass: false
      };
    }

    if (iterator() !== undefined) {
      let remaining = 0;
      iterator.forEach(_ => ++remaining);
      return {
        message: () => `too many items in EditList, expected ${spans.length}, actual ${remaining + i + 1}`,
        pass: false
      }
    }

    return {
      message: () => 'expected EditLists to not contain the given spans',
      pass: true
    };
  }
});

function makeSpan({origin = "origin", start = 10, length = 20} = {}) {
  return span(origin, start, length);
}

function sumLengths(spans) {
  return spans.reduce((a, s) => a + s.length, 0);
}

describe('editList', () => {
  it('sets the spans to the given initial spans if they do not abut', () => {
    let s1 = span("a", 1, 2), s2 = span("b", 3, 4);
    expect(editList(s1, s2)).hasSpans(s1, s2);
  });

  it('merges spans that abut', () => {
    let s1 = span("a", 1, 2), s2 = span("a", s1.next, 4);
    expect(editList(s1, s2)).hasSpans(span("a", 1, 6));
  });

  it('takes all spans from a EditList', () => {
    let s1 = span("a", 1, 2), s2 = span("a", 2, 4);
    let ss = editList(s1, s2);
    expect(editList(ss)).hasSpans(s1, s2);
  });

  it('merges middle spans from EditLists if they abut', () => {
    let s1a = span("a", 0, 5), s1b = span("a", 1, 5), s1c = span("a", 10, 5);
    let s2a = span("a", 15, 20), s2b = span("a", 2, 10), s2c = span("a", 3, 10);
    let ss1 = editList(s1a, s1b, s1c), ss2 = editList(s2a, s2b, s2c);

    expect(editList(ss1, ss2)).hasSpans(s1a, s1b, s1c.merge(s2a), s2b, s2c);
  });


  it('merges all spans passed if they abut', () => {
    let s1a = span("a", 0, 5), s1b = span("a", 5, 5), s1c = span("a", 10, 5);
    let s2a = span("a", 15, 20), s2b = span("a", 35, 10), s2c = span("a", 45, 10);
    let ss1 = editList(s1a, s1b, s1c), ss2 = editList(s2a, s2b, s2c);

    expect(editList(ss1, ss2)).hasSpans(span("a", 0, 55));
  });

  it('ignores empty EditLists', () => {
    let s1 = span("a", 1, 2), s2 = span("a", 2, 4);

    expect(editList(editList(), s1, editList(), s2, editList())).hasSpans(s1, s2);
  });
});

describe('concLength', () => {
  it('returns 0 for empty set', () => {
    expect(editList().concLength()).toEqual(0);
  });

  it('returns the length of a span when it has one span', () => {
    let ss = editList();
    ss.append(makeSpan({length: 100}));
    expect(ss.concLength()).toEqual(100);
  });

  it('returns the sum of the lengths of spans it contains', () => {
    let ss = editList();
    ss.append(makeSpan({length: 100}));
    ss.append(makeSpan({length: 50}));
    ss.append(makeSpan({length: 3}));
    expect(ss.concLength()).toEqual(153);
  });
});

describe('editSource', () => {
  it('returns undefined if the array is empty', () => {
    let iterator = editList().editSource();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
  });

  it('returns the spans in sequence', () => {
    let s1 = span("a", 1, 10), s2 = span("b", 2, 2), s3 = span("c", 30, 300);
    let ss = editList(s1, s2, s3);
    let iterator = ss.editSource();

    expect(iterator()).toEqualSpan(s1);
    expect(iterator()).toEqualSpan(s2);
    expect(iterator()).toEqualSpan(s3);
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

    it('calls the callback with all the present spans in order', () => {
      const mockCallback = jest.fn(x => x);
      let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
      let ss = editList(s1, s2, s3);

      ss.editSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(3);
      expect(mockCallback.mock.calls[0][0]).toEqualSpan(s1);
      expect(mockCallback.mock.calls[1][0]).toEqualSpan(s2);
      expect(mockCallback.mock.calls[2][0]).toEqualSpan(s3);
    });

    it('calls the callback with the sum of the lengths of the previous spans', () => {
      const mockCallback = jest.fn((x, y) => x);
      let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
      let ss = editList(s1, s2, s3);

      ss.editSource().forEach(mockCallback);

      expect(mockCallback.mock.calls[0][1]).toEqual(0);
      expect(mockCallback.mock.calls[1][1]).toEqual(20);
      expect(mockCallback.mock.calls[2][1]).toEqual(50);
    });

    it('continues from where the iterator left off', () => {
      const mockCallback = jest.fn(x => x);
      let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
      let ss = editList(s1, s2, s3);
      let source = ss.editSource();

      source();
      source.forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(2);
      expect(mockCallback.mock.calls[0][0]).toEqualSpan(s2);
      expect(mockCallback.mock.calls[0][1]).toEqual(20);
      expect(mockCallback.mock.calls[1][0]).toEqualSpan(s3);
      expect(mockCallback.mock.calls[1][1]).toEqual(50);
    });
  });
});

describe('range', () => {
  it('has no spans if the EditList was empty', () => {
    expect(editList().range(0, 100)).hasSpans();
  });

  it('returns all spans if the start and length include them all', () => {
    let spans = makeSpans(5);
    expect(editList(...spans).range(0, sumLengths(spans))).hasSpans(...spans);
  });

  it('returns only the first spans if the later ones are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(0, -2);
    expect(editList(...spans).range(0, sumLengths(subset))).hasSpans(...subset);
  });

  it('returns the first spans when the start point is negative', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(0, -2);
    expect(editList(...spans).range(-1, sumLengths(subset))).hasSpans(...subset);
  });

  it('returns only the last spans if the earlier ones are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(2);
    let start = spans[0].length + spans[1].length;
    expect(editList(...spans).range(start, sumLengths(subset))).hasSpans(...subset);
  });

  it('returns the last spans if the length is excessive', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(2);
    let start = spans[0].length + spans[1].length;
    expect(editList(...spans).range(start, sumLengths(subset) + 1)).hasSpans(...subset);
  });

  it('returns only the middle spans if the ends are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(1, -1);
    expect(editList(...spans).range(spans[0].length, sumLengths(subset))).hasSpans(...subset);
  });

  it('splits a span if the start point lies within it', () => {
    let spans = makeSpans(5);
    let subset = [spans[1].crop(2), ...spans.slice(2)];
    expect(editList(...spans).range(spans[0].length + 2, sumLengths(subset))).hasSpans(...subset);
  });

  it('splits a span if the end point lies within it', () => {
    let spans = makeSpans(5);
    let subset = [...spans.slice(0, 3), spans[3].crop(0, 3)];
    let length = spans[0].length + spans[1].length + spans[2].length + 3;
    expect(editList(...spans).range(0, length)).hasSpans(...subset);
  });

  it('splits a span if the start and end points lie within it', () => {
    let spans = makeSpans(5);
    let remaining = spans[2].crop(1, spans[2].length - 2);
    let start = spans[0].length + spans[1].length + 1;
    expect(editList(...spans).range(start, spans[2].length - 2)).hasSpans(remaining);
  });

  it('returns no spans if the start is greater than or equal to the span length', () => {
    let spans = makeSpans(5);
    expect(editList(...spans).range(sumLengths(spans), 10)).hasSpans();
  });

  it('returns no spans if the length is 0', () => {
    let spans = makeSpans(5);
    expect(editList(...spans).range(11, 0)).hasSpans();
  });
});
