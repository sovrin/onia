import type {Result, Context, Parser, Failure, Success} from './types';
import {define} from './utils';

/**
 *
 * @param context
 * @param value
 */
const success = <T>(context: Context, value: T): Success<T> => ({
    success: true,
    value,
    context,
});

/**
 *
 * @param context
 * @param expected
 */
const failure = (context: Context, expected: string): Failure => ({
    success: false,
    expected,
    context,
});

/**
 *
 * @param match
 */
const alpha = (match: string): Parser<string> => (
    define((({index, text}) => {
        const next = index + match.length;

        return (text.substring(index, next) === match)
            ? success({text, index: next}, match)
            : failure({text, index}, match)
        ;
    }), {
        toString: () => match,
    })
);

/**
 *
 * @param regex
 * @param expected
 */
const regex = (regex: RegExp, expected: string): Parser<string> => (
    define((({index, text}) => {
        regex.lastIndex = index;
        const res = regex.exec(text);

        return (res && res.index === index)
            ? success({text, index: index + res[0].length}, res[0])
            : failure({text, index}, expected)
        ;
    }), {
        toString: () => regex.toString(),
    })
);

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
 * Time: 18:49
 */
export default <T>(text: string, parser: Parser<T>) => {
    const context: Context = {
        text,
        index: 0,
    };

    const result = parser(context);
    if (result.success === true) {
        return result.value;
    }

    throw new Error(result.expected);
}
export {
    any,
    many,
    map,
    optional,
    sequence,
    success,
    failure,
    alpha,
    regex,
};
export {
    int,
    float,
    pop,
    shift,
    join,
    flatten,
    filter,
    pipe,
} from './utils';
