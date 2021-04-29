import {failure, success} from './flow';
import {Parser} from './types';

/**
 *
 * @param match
 */
const alpha = (match: string): Parser<string> => (
    ({index, text}) => {
        const next = index + match.length;

        return (text.substring(index, next) === match)
            ? success({text, index: next}, match)
            : failure({text, index}, match)
        ;
    }
);

/**
 *
 * @param regex
 * @param expected
 */
const regex = (regex: RegExp, expected: string): Parser<string> => (
    ({index, text}) => {
        regex.lastIndex = index;
        const res = regex.exec(text);

        return (res && res.index === index)
            ? success({text, index: index + res[0].length}, res[0])
            : failure({text, index}, expected)
        ;
    }
);

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 29.04.2021
 * Time: 17:52
 */
export {
    alpha,
    regex
}
