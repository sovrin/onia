import assert from 'assert';
import {Result} from '../src';

/**
 *
 * @param value
 */
const serialize = (value): string => JSON.stringify(value);

/**
 *
 * @param result
 * @param expect
 */
export const assertSuccess = <T>(result: Result<T>, expect: T) => assert(result.success === true && serialize(result.value) === serialize(expect), expect && expect.toString());

/**
 *
 * @param result
 * @param expect
 */
export const assertFailure = <T>(result: Result<T>, expect: string) => assert(result.success === false && serialize(expect) === serialize(result.expected), expect);

export const assertType = <T>(expression: T) => {
    // Do nothing, the TypeScript compiler handles this for us
};
