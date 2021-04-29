import {Context, Failure, Success} from './types';

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
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 29.04.2021
 * Time: 17:58
 */
export {
    success,
    failure,
};
