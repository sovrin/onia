import type {Result, Success} from './types';

export const define = <T>(parser: T, record: Record<string, (() => unknown) | string>): T => {
    for (const key in record) {
        const {[key]: value} = record;

        Object.defineProperty(parser, key, {
            value,
        });
    }

    return parser;
};

export const isSuccess = <T>(result: Result<T>): result is Success<T> => (
    result.success === true
);
