import {Parser} from './types';

/**
 *
 */
export const flatten = () => (haystack: any[]) => haystack.flat(1);

/**
 *
 */
export const pop = () => (haystack: any[]) => haystack.pop();

/**
 *
 */
export const shift = () => (haystack: any[]) => haystack.shift();

/**
 *
 */
export const join = () => (haystack: string[]) => haystack.join('');

/**
 *
 */
export const int = () => (number: string) => parseInt(number);

/**
 *
 */
export const float = () => (number: string) => parseFloat(number);

/**
 *
 * @param values
 */
export const filter = (values: (string | Parser<any>)[]) => (haystack: any[]) => {
    const lookup = values.map((value) => value.toString())
        .filter(Boolean)
    ;

    return haystack.filter((value) => value !== null)
        .filter((element) => !lookup.includes(element))
        .filter((element) => element != undefined)
    ;
};

/**
 *
 * @param fns
 */
export const pipe = (...fns) => (x) => fns.reduce((y, f) => f(y), x);

/**
 *
 * @param parser
 * @param fns
 */
export const define = <T>(parser: T, fns: Record<string, () => any>): T => {
    for (const key in fns) {
        const {[key]: value} = fns;
        Object.defineProperty(parser, key, {
            value,
        });
    }

    return parser;
};
