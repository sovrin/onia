import {any, map, many, optional, sequence, alpha, regex, success, failure} from '../src';
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
    })
});
