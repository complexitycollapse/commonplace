import { span, clone } from './commonplace-core';

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
        let original = span("origin", 10, 20);
        expect(original.clone()).toEqualSpan(original);
    });

    it('replaces only origin when that is passed as a parameter', () => {
        expect(span("origin", 10, 20).clone({ origin: "other" })).toEqual(expect.objectContaining({origin: "other", start: 10, length: 20}))
    });

    it('replaces only start when that is passed as a parameter', () => {
        expect(span("origin", 10, 20).clone({ start: 99 })).toEqual(expect.objectContaining({origin: "origin", start: 99, length: 20}))
    });

    it('replaces only length when that is passed as a parameter', () => {
        expect(span("origin", 10, 20).clone({ length: 99 })).toEqual(expect.objectContaining({origin: "origin", start: 10, length: 99}))
    });
});
