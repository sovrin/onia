import {Parser, Success} from './types';

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
    /**
     *
     * @param value
     */
    const resolve = (value: string | Parser<any>) => {
        if (typeof value === 'function') {
            const needle = haystack.map((needle) => value({index: 0, text: needle}))
                .find((value) => value.success) as Success<any>
            ;

            if (!needle) {
                return null;
            }

            return needle.value;
        }

        return value;
    };

    const lookup = values.map(resolve)
        .filter(Boolean)
    ;

    return haystack.filter(Boolean)
        .filter((element) => !lookup.includes(element))
    ;
};

/**
 *
 * @param fns
 */
export const pipe = (...fns) => (x) => fns.reduce((y, f) => f(y), x);
