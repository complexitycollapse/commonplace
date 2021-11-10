import {describe, expect, it, test} from '@jest/globals';
import { span } from './commonplace-core';

expect.extend({
    toEqualSpan(actualSpan, expectedSpan) {
        let pass = actualSpan.origin === expectedSpan.origin
            && actualSpan.start === expectedSpan.start
            && actualSpan.length === expectedSpan.length;

        if (pass) {
            return {
                message: () => `expected ${JSON.stringify(actualSpan)} to not equal ${JSON.stringify(expectedSpan)}`,
                pass: true
            };
        } else {
            return {
                message: () => `expected ${JSON.stringify(actualSpan)} to equal ${JSON.stringify(expectedSpan)}`,
                pass: false
            };
        }
    }
});

function make() {
    return span("origin", 10, 20);
}

describe('span', () => {
    it('has origin, start and length', () => {
        let actual = span("origin", 1, 100);
        expect(actual.origin).toEqual("origin");
        expect(actual.start).toEqual(1);
        expect(actual.length).toEqual(100);
    });
});

describe('clone', () => {
    it('produces an exact copy when there are no arguments', () => {
        let original = make();
        expect(original.clone()).toEqualSpan(original);
    });

    it('produces an exact copy when passed an empty object', () => {
        let original = make();
        expect(original.clone({})).toEqualSpan(original);
    });

    it('replaces only origin when that is passed as a parameter', () => {
        expect(make().clone({ origin: "other" })).toEqual(expect.objectContaining({origin: "other", start: 10, length: 20}))
    });

    it('replaces only start when that is passed as a parameter', () => {
        expect(make().clone({ start: 99 })).toEqual(expect.objectContaining({origin: "origin", start: 99, length: 20}))
    });

    it('replaces only length when that is passed as a parameter', () => {
        expect(make().clone({ length: 99 })).toEqual(expect.objectContaining({origin: "origin", start: 10, length: 99}))
    });
});

describe('basic span functions', () => {
    test('next returns the position exactly after the end of the span', () => {
        expect(make().next()).toEqual(30);
    });

    test('end returns the last position occupied by the span', () => {
        expect(make().end()).toEqual(29);
    });

    test('equalOrigin returns true if the origins are the same', () => {
        expect(span("origin1", 10, 20).equalOrigin(span("origin1", 15, 25)));
    });

    test('equalOrigin returns false if the origins are different', () => {
        expect(span("origin1", 10, 20).equalOrigin(span("origin2", 10, 20)));
    });

    test('startDiff returns the difference between the start points or two spans', () => {
        expect(make().startDiff(span("abc", 15, 20))).toEqual(-5);
    });

    test('endDiff returns the difference between the start points or two spans', () => {
        expect(make().endDiff(span("abc", 10, 15))).toEqual(5);
    });

    test('displace returns a span whose start has been moved by the given amount', () => {
        let original = make();
        expect(original.displace(22)).toEqualSpan(span(original.origin, original.start + 22, original.length));
    });
});

describe('contains', () => {
    it('is false if the point is before the span', () => {
        let s = make();
        expect(s.contains(s.start -1)).toBeFalsy();
    });

    it('is false if the point is after the span', () => {
        let s = make();
        expect(s.contains(s.next())).toBeFalsy();
    });

    it('is true if the point is the start of the span', () => {
        let s = make();
        expect(s.contains(s.start)).toBeTruthy();
    });

    it('is true if the point is the end of the span', () => {
        let s = make();
        expect(s.contains(s.end())).toBeTruthy();
    });

    it('is true if the point is within the span', () => {
        let s = make();
        expect(s.contains(15)).toBeTruthy();
    });

    it('is true if the span is one point long and the point equals it', () => {
        let s = span("origin", 100, 1);
        expect(s.contains(s.start)).toBeTruthy();
    });
});

describe('abuts', () => {
    it('returns true when the next position of the 1st span is equal to the start of the 2nd', () => {
        let s1 = make();
        let s2 = s1.clone({start: s1.next()});
        expect(s1.abuts(s2)).toBeTruthy();
    });

    it('returns false if the spans have different origins', () => {
        let s1 = make();
        let s2 = s1.clone({origin: "something else", start: s1.next()});
        expect(s1.abuts(s2)).toBeFalsy();
    });

    it('returns false if the spans overlap', () => {
        let s1 = make();
        let s2 = s1.clone({start: s1.end()});
        expect(s1.abuts(s2)).toBeFalsy();
    });

    it('returns false the abut the wrong way round', () => {
        let s1 = make();
        let s2 = s1.clone({start: s1.next()});
        expect(s2.abuts(s1)).toBeFalsy();
    });

    it('returns false if the spans have a gap between them', () => {
        let s1 = make();
        let s2 = s1.clone({start: s1.next() + 1});
        expect(s1.abuts(s2)).toBeFalsy();
    });
});

describe('overlaps', () => {
    it('returns false if the span has a different origin', () => {
        let s1 = make();
        let s2 = s1.clone({ origin: "different" });
        expect(s1.overlaps(s2)).toBeFalsy();
    });

    it('returns true if the span touches our end', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.end() });
        expect(s1.overlaps(s2)).toBeTruthy();
    });

    it('returns true if we touch the end of the span', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.end() });
        expect(s2.overlaps(s1)).toBeTruthy();
    });

    it('returns true if the spans are coextensive', () => {
        let s1 = make();
        let s2 = s1.clone();
        expect(s1.overlaps(s2)).toBeTruthy();
    });

    it('returns false if the span is just after', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.next() });
        expect(s1.overlaps(s2)).toBeFalsy();
    });

    it('returns false if the span is just before', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.next() });
        expect(s2.overlaps(s1)).toBeFalsy();
    });

    it('returns true if we contain the span', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.start + 1, length: s1.length - 1});
        expect(s1.overlaps(s2)).toBeTruthy();
    });

    it('returns true if the span contains us', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.start + 1, length: s1.length - 1});
        expect(s2.overlaps(s1)).toBeTruthy();
    });
});

describe('canMergeWith', () => {
    it('is false if the spans have different origins', () => {
        let s1 = make();
        let s2 = s1.clone({ origin: "different" });
        expect(s1.canMergeWith(s2)).toBeFalsy();
    });

    it('returns true if the span touches our end', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.end() });
        expect(s1.canMergeWith(s2)).toBeTruthy();
    });

    it('returns true if we touch the end of the span', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.end() });
        expect(s2.canMergeWith(s1)).toBeTruthy();
    });

    it('returns true if the spans are coextensive', () => {
        let s1 = make();
        let s2 = s1.clone();
        expect(s1.canMergeWith(s2)).toBeTruthy();
    });

    it('returns true if the span is just after', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.next() });
        expect(s1.canMergeWith(s2)).toBeTruthy();
    });

    it('returns true if the span is just before', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.next() });
        expect(s2.canMergeWith(s1)).toBeTruthy();
    });

    it('returns false if the span is after with a gap between', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.next() + 1 });
        expect(s1.canMergeWith(s2)).toBeFalsy();
    });

    it('returns false if the span is before with a gap between', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.next() + 1 });
        expect(s2.canMergeWith(s1)).toBeFalsy();
    });

    it('returns true if we contain the span', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.start + 1, length: s1.length - 1});
        expect(s1.canMergeWith(s2)).toBeTruthy();
    });

    it('returns true if the span contains us', () => {
        let s1 = make();
        let s2 = s1.clone({ start: s1.start + 1, length: s1.length - 1});
        expect(s2.canMergeWith(s1)).toBeTruthy();
    });
});