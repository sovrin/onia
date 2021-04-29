import {alpha, regex} from './combinators';
import {failure, success} from './flow';
import {any, many, map, optional, sequence} from './controls';
import {Context, Parser} from './types';

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
