import {failure, success} from './responses';
import {define, isSuccess} from './utils';
import type {Context, Parser, Result} from './types';

export function alpha (char: string, expected?: string): Parser<string> {
    const alpha = function ({index, text}) {
        const next = index + char.length;

        return (text.substring(index, next) === char)
            ? success({text, index: next}, char)
            : failure.bind(alpha)({text, index}, expected);
    };

    return define(alpha, {
        toString: () => char,
        name: '[Parser alpha]',
        expected,
    });
}

export function regex (pattern: RegExp, expected?: string): Parser<string> {
    const regex = function ({index, text}) {
        pattern.lastIndex = index;
        const res = pattern.exec(text);

        return (res && res.index === index)
            ? success({text, index: index + res[0].length}, res[0])
            : failure.bind(regex)({text, index}, expected);
    };

    return define(regex, {
        toString: () => pattern.toString(),
        name: '[Parser regex]',
        expected,
    });
}

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
        export: () => parsers,
        name: '[Parser sequence]',
        expected,
    });
}

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
        export: () => parsers,
        name: '[Parser any]',
        expected,
    });
}

export function optional<T> (parser: Parser<T>, carry = true, expected?: string): Parser<T | null> {
    const optional = map(
        any([parser, (context) => success(context, null)]),
        (value) => carry
            ? value
            : null,
        expected,
    );

    return define(optional, {
        export: () => parser,
        name: '[Parser optional]',
        expected,
    });
}

export function many<T> (parser: Parser<T>, expected?: string): Parser<ReadonlyArray<T>> {
    const many = function (context: Context) {
        const values: Array<T> = [];
        let next = context;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const res = parser(next);
            if (!isSuccess(res)) {
                break;
            }

            values.push(res.value);
            next = res.context;
        }

        return success(next, values);
    };

    return define(many, {
        export: () => parser,
        name: '[Parser many]',
        expected,
    });
}

export function map<A, B> (parser: Parser<A>, transform: (val: A) => B, expected?: string): Parser<B> {
    const map = function (context: Context) {
        const res = parser(context);

        return isSuccess(res)
            ? success(res.context, transform.bind(parser)(res.value))
            : failure.bind(map)(res.context, [expected, res.expected]);
    };

    return define(map, {
        export: () => parser,
        name: '[Parser map]',
        expected,
    });
}

export function lazy<T>(factory: () => Parser<T>, expected?: string): Parser<T> {
    let parser: Parser<T> | null = null;

    const lazy = (context: Context): Result<T> => {
        if (!parser) {
            parser = factory();
        }

        return parser(context);
    };

    return define(lazy, {
        name: '[Parser lazy]',
        expected,
    });
}
