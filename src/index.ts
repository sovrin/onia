import type {Context, Parser} from './types';

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
};
export * from './responses';
export * from './parsers';
export * from './helpers';
export * from './types';
