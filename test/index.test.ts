import onia, {
    any,
    map,
    many,
    optional,
    sequence,
    alpha,
    regex,
    success,
    failure,
    int,
    float,
    pop,
    shift,
    pipe,
    flatten,
    join,
    filter,
} from '../src';
import {assertFailure, assertSuccess} from './utils';
import assert from 'assert';

describe('onia', () => {
    const foo = alpha('foo');
    const bar = alpha('bar');

    describe('success', () => {
        it('should return expected values', () => {
            assert(success(null, null).success === true);
            assert(success(null, 'value').value === 'value');
        });
    });

    describe('failure', () => {
        it('should return expected values', () => {
            assert(failure(null, null).success === false);
            assert(failure(null, 'value').expected === 'value');
        });
    });

    describe('alpha', () => {
        it('should parse string', () => {
            const o = alpha('o');

            assertSuccess(o({index: 0, text: 'o'}), 'o');
            assertFailure(o({index: 1, text: 'o'}), 'o');
            assertFailure(o({index: -1, text: 'o'}), 'o');
            assertFailure(o({index: 0, text: ''}), 'o');
        });
    });

    describe('regex', () => {
        it('should parse regex', () => {
            const number = regex(/[0-9]/g, 'number');

            assertSuccess(number({index: 0, text: '01'}), '0');
            assertSuccess(number({index: 1, text: '01'}), '1');
            assertFailure(number({index: 0, text: ''}), 'number');
            assertFailure(number({index: 0, text: 'a'}), 'number');
        });
    });

    describe('any', () => {
        it('should parse nothing', () => {
            const fn = any([]);

            assert(fn({index: 0, text: 'foo'}) === null);
        });

        it('should parse first', () => {

            const fn = any([foo]);

            assertSuccess(fn({index: 0, text: 'foo'}), 'foo');
        });

        it('should parse second', () => {
            const fn = any([foo, bar]);

            assertSuccess(fn({index: 0, text: 'bar'}), 'bar');
        });

        it('should parse first of two', () => {
            const fn = any([foo, bar]);

            assertSuccess(fn({index: 0, text: 'foo bar'}), 'foo');
        });

        it('should parse none', () => {
            const fn = any([bar, foo]);

            assertFailure(fn({index: 1, text: 'foo bar'}), 'bar');
        });
    });

    describe('many', () => {
        it('should parse none', () => {
            const fn = many(foo);

            assertSuccess(fn({index: 0, text: ''}), []);
        });

        it('should parse one', () => {
            const fn = many(foo);

            assertSuccess(fn({index: 0, text: 'foo'}), ['foo']);
        });

        it('should parse several', () => {
            const fn = many(foo);

            assertSuccess(fn({index: 0, text: 'foofoofoo'}), ['foo', 'foo', 'foo']);
            assertSuccess(fn({index: 1, text: 'foofoofoo'}), []);
            assertSuccess(fn({index: 0, text: 'bar'}), []);
            assertSuccess(fn({index: 0, text: 'foobar'}), ['foo']);
        });
    });

    describe('optional', () => {
        it('should return null', () => {
            const fn = optional(foo);

            assertSuccess(fn({index: 0, text: ''}), null);
        });

        it('should return foo', () => {
            const fn = optional(foo);

            assertSuccess(fn({index: 0, text: 'foo'}), 'foo');
        });
    });

    describe('map', () => {
        it('should map nothing', () => {
            let v;
            const fn = map(foo, (val) => {
                v = val;
            })

            assertFailure(fn({index: 0, text: ''}), 'foo');
            assert(v === undefined);
        });

        it('should map foo', () => {
            let v = '';
            const fn = map(foo, (val) => {
                v = val;
            })

            assertSuccess(fn({index: 0, text: 'foo'}), undefined);
            assert(v === 'foo');
        });
    });

    describe('sequence', () => {
        it('should sequence nothing', () => {
            const fn = sequence([]);

            assertSuccess(fn({index: 0, text: 'foo'}), []);
        });

        it('should fail at incomplete sequence', () => {
            const fn = sequence([foo, bar]);

            assertFailure(fn({index: 0, text: 'foo'}), 'bar');
        });

        it('should sequence strings', () => {
            const fn = sequence([foo, bar]);

            assertSuccess(fn({index: 0, text: 'foobar'}), ['foo', 'bar']);
        });
    });

    describe('utils', () => {
        describe('int', () => {
            const string = map(
                regex(/.*/g, 'string'),
                int(),
            );

            it('should cast value to int', () => {
                assertSuccess(string({index: 0, text: '0.12'}), 0);
            });
        });

        describe('float', () => {
            const string = map(
                regex(/.*/g, 'string'),
                float(),
            );

            it('should cast value to float', () => {
                assertSuccess(string({index: 0, text: '0.12'}), 0.12);
            });
        });

        describe('shift', () => {
            const string = map(
                regex(/\d/g, 'digit'),
                int(),
            );

            const term = map(
                sequence<any>([
                    string,
                    string,
                    string,
                ]),
                shift(),
            );

            it('should get the first element', () => {
                assertSuccess(term({index: 0, text: '123'}), 1);
            });
        });

        describe('pop', () => {
            const string = map(
                regex(/\d/g, 'digit'),
                int(),
            );

            const term = map(
                sequence<any>([
                    string,
                    string,
                    string,
                ]),
                pop(),
            );

            it('should get the last element', () => {
                assertSuccess(term({index: 0, text: '123'}), 3);
            });
        });

        describe('pipe', () => {
            const string = map(
                regex(/\d/g, 'digit'),
                int(),
            );

            const term = map(
                sequence([
                    string,
                    string,
                    string,
                ]),
                pipe(
                    (v) => v.map((n) => n + 1),
                    (v) => v.join('_'),
                ),
            );

            it('should pipe value to each fn and transform', () => {
                assertSuccess(term({index: 0, text: '123'}), '2_3_4');
            });
        });

        describe('flatten', () => {
            const character = any([
                regex(/[a-z]/ig, 'letter'),
                map(
                    regex(/\d/g, 'digit'),
                    int(),
                ),
            ]);

            const term = map(
                sequence([
                    character,
                    optional<any>(
                        many(
                            map(
                                sequence<any>([
                                    character,
                                ]),
                                pop(),
                            ),
                        ),
                    ),
                ]),
                flatten(),
            );

            it('should flatten result value', () => {
                assertSuccess(term({index: 0, text: 'foobar'}), ['f', 'o', 'o', 'b', 'a', 'r']);
            });
        });

        describe('join', () => {
            const letter = regex(/[a-z]/ig, 'letter');

            const digit = map(
                regex(/\d/g, 'digit'),
                int(),
            );

            const character = any([
                letter,
                digit,
            ]);

            const term = map(
                sequence<any>([
                    character,
                    map(
                        many(character),
                        join(),
                    )],
                ),
                join(),
            );

            it('should join result value', () => {
                assertSuccess(term({index: 0, text: 'foo123bar'}), 'foo123bar');
            });
        });

        describe('filter', () => {
            const string = regex(/\w+/ig, 'string');

            const term = map(
                sequence<any>([
                    alpha('{'),
                    string,
                    alpha('}'),
                ]),
                filter([
                    '{',
                    '}',
                ]),
            );

            it('should filter out braces', () => {
                assertSuccess(term({index: 0, text: '{foobar}'}), ['foobar']);
            });
        });
    });

    describe('example', () => {
        const digit = map(
            regex(/\d/g, 'digit'),
            (digit) => parseInt(digit)
        );
        const digits = map(
            many(digit),
            (digit) => parseInt(digit.join(''))
        );
        const whitespace = alpha(' ');
        const operator = regex(/[+-]/g, 'operator');
        const term = map(
            sequence<any>([digits, optional(whitespace), operator, optional(whitespace), digits]),
            ([left, , operator, , right]) => [left, operator, right],
        );

        it('should parse simple expression', () => {
            const [left, operator, right] = onia('123 + 321', term);

            assert(left === 123);
            assert(operator === '+');
            assert(right === 321);
        });

        it('should throw error', () => {
            assert.throws(() => onia('foo / bar', term));
        });
    });
});
