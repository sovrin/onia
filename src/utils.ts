import {Result, Success} from './types';

/**
 *
 * @param parser
 * @param fns
 */
export const define = <T>(parser: T, fns: Record<string, (() => unknown) | string>): T => {
    for (const key in fns) {
        const {[key]: value} = fns;

        Object.defineProperty(parser, key, {
            value,
        });
    }

    return parser;
};

/**
 *
 * @param result
 */
export const isSuccess = <T>(result: Result<T>): result is Success<T> => (
    result.success === true
);
