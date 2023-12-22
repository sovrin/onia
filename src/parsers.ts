import {failure, success} from './responses';
import {define, isSuccess} from './utils';
import type {Context, Parser, Result} from './types';

/**
 *
 * @param match
 * @param expected
 */
export function alpha (match: string, expected?: string): Parser<string> {
    const alpha = function ({index, text}) {
        const next = index + match.length;

        return (text.substring(index, next) === match)
            ? success({text, index: next}, match)
            : failure.bind(alpha)({text, index}, expected);
    };

    return define(alpha, {
        toString: () => match,
        name: '[Parser alpha]',
        expected,
    });
}

/**
 *
 * @param match
 * @param expected
 */
export function regex (match: RegExp, expected?: string): Parser<string> {
    const regex = function ({index, text}) {
        match.lastIndex = index;
        const res = match.exec(text);

        return (res && res.index === index)
            ? success({text, index: index + res[0].length}, res[0])
            : failure.bind(regex)({text, index}, expected);
    };

    return define(regex, {
        toString: () => match.toString(),
        name: '[Parser regex]',
        expected,
    });
}

/**
 *
 * @param parsers
 * @param expected
 */
export function sequence<T extends ReadonlyArray<Parser<unknown>>> (parsers: T, expected?: string): Parser<{
    [K in keyof T]: T[K] extends Parser<infer U> ? U : never;
}> {
    function sequence (context: Context) {
        const values: Array<T> = [];
        let next = context;

        for (const parser of parsers) {
            const res = parser(next) as Result<T>;
            if (!isSuccess(res)) {
                return failure.bind(sequence)(res.context, [expected, res.expected]);
            }

            values.push(res.value);
            next = res.context;
        }

        return success(next, values);
    }

    return define(sequence, {
        name: '[Parser sequence]',
        expected,
    });
}

/**
 *
 * @param parsers
 * @param expected
 */
export function any<T extends ReadonlyArray<Parser<unknown>>> (parsers: T, expected?: string): Parser<T[number] extends Parser<infer U> ? U : never> {
    const any = function (context: Context) {
        let next: Result<T> | null = null;

        for (const parser of parsers) {
            const res = parser(context);
            if (isSuccess(res)) {
                return res;
            }

            if (!next || next.context.index < res.context.index) {
                next = res;
            }
        }

        return failure.bind(any)(next?.context, expected);
    };

    return define(any, {
        name: '[Parser any]',
        expected,
    });
}

/**
 *
 * @param parser
 * @param carry
 * @param expected
 */
export function optional<T> (parser: Parser<T>, carry = true, expected?: string): Parser<T | null> {
    const optional = map(
        any([parser, (context) => success(context, null)]),
        (value) => carry
            ? value
            : null,
        expected,
    );

    return define(optional, {
        name: '[Parser optional]',
        expected,
    });
}

/**
 *
 * @param parser
 * @param expected
 */
export function many<T> (parser: Parser<T>, expected?: string): Parser<ReadonlyArray<T>> {
    const many = function (context: Context) {
        const values: Array<T> = [];
        let next = context;

        let loop = true;
        while (loop) {
            const res = parser(next);
            if (!isSuccess(res)) {
                loop = false;

                continue;
            }

            values.push(res.value);

            next = res.context;
        }

        return success(next, values);
    };

    return define(many, {
        name: '[Parser many]',
        expected,
    });
}

/**
 *
 * @param parser
 * @param fn
 * @param expected
 */
export function map<A, B> (parser: Parser<A>, fn: (val: A) => B, expected?: string): Parser<B> {
    const map = function (context: Context) {
        const res = parser(context);

        return isSuccess(res)
            ? success(res.context, fn(res.value))
            : failure.bind(map)(res.context, [expected, res.expected]);
    };

    return define(map, {
        name: '[Parser map]',
        expected,
    });
}
