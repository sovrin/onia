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
export const filter = (values: any[]) => (haystack: any[]) => (
    haystack.filter(Boolean)
        .filter(element => !values.includes(element))
);

/**
 *
 * @param fns
 */
export const pipe = (...fns) => (x) => fns.reduce((y, f) => f(y), x);
