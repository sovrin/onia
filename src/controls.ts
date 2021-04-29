import {success} from './flow';
import {Parser, Result} from './types';

/**
 *
 * @param parsers
 */
const sequence = <T>(parsers: Parser<T>[]): Parser<T[] | T> => (
    (context) => {
        const values: T[] = [];
        let next = context;

        for (const parser of parsers) {
            const res = parser(next);

            if (!res.success) {
                return res;
            }

            values.push(res.value);
            next = res.context;
        }

        return success(next, values);
    }
);

/**
 *
 * @param parsers
 */
const any = <T>(parsers: Parser<T>[]): Parser<T> => (
    (context) => {
        let next: Result<T> | null = null;

        for (const parser of parsers) {
            const res = parser(context);

            if (res.success) {
                return res;
            }

            if (!next || next.context.index < res.context.index) {
                next = res;
            }
        }

        return next;
    }
);

/**
 *
 * @param parser
 */
const optional = <T>(parser: Parser<T>): Parser<T | null> => (
    any([parser, context => success(context, null)])
);

/**
 *
 * @param parser
 */
const many = <T>(parser: Parser<T>): Parser<T[]> => (
    (context) => {
        const values: T[] = [];
        let next = context;

        while (true) {
            const res = parser(next);

            if (!res.success) {
                break;
            }

            values.push(res.value);

            next = res.context;
        }

        return success(next, values);
    }
);

/**
 *
 * @param parser
 * @param fn
 */
const map = <A, B>(parser: Parser<A>, fn: (val: A) => B): Parser<A | B> => (
    (context) => {
        const res = parser(context);

        return res.success
            ? success(res.context, fn(res.value))
            : res
        ;
    }
);

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 29.04.2021
 * Time: 17:52
 */
export {
    any,
    many,
    map,
    optional,
    sequence,
}

