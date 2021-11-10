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
});
