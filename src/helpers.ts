import {Parser} from "./types";

type Tail<T extends ReadonlyArray<unknown>> =
    ((...rest: T) => void) extends ((h: unknown, ...r: infer R) => void) ? R : never;

type FirstElement<T extends ReadonlyArray<unknown>> = T[0];

type LastElement<T extends ReadonlyArray<unknown>> = T[Exclude<keyof T, keyof Tail<T>>];

type PickValue<T> = T extends ReadonlyArray<infer U> ? U : T;

type FlattenArray<T extends ReadonlyArray<unknown>> = Array<PickValue<T[number]>>;

type PipeFunction<A, B> = (this: Parser<A>, arg: A) => B;

export const flatten = () => <T extends ReadonlyArray<unknown>>(haystack: T): FlattenArray<T> => haystack.flat(1) as FlattenArray<T>;

export const pop = () => <T extends ReadonlyArray<unknown>>(haystack: T): LastElement<T> => haystack.at(-1) as LastElement<T>;

export const shift = () => <T extends ReadonlyArray<unknown>>(haystack: T): FirstElement<T> => haystack.at(0);

export const join = () => <T extends ReadonlyArray<unknown>>(haystack: T): string => haystack.join('');

export const expand = () => <T>(...haystack: ReadonlyArray<T>): ReadonlyArray<T> => haystack;

export function zip<V, T, R>(
    mapper: (parser: Parser<V>, value: T) => R
) {
    return function (this: Parser<ReadonlyArray<V>>, values: ReadonlyArray<T>): ReadonlyArray<R> {
        const parsers = this.export() as ReadonlyArray<Parser<V>>;

        return parsers.map((parser, index) => mapper(parser, values[index])) as ReadonlyArray<R>;
    };
}

export const int = () => (number: string) => parseInt(number);

export const float = () => (number: string) => parseFloat(number);

export const filter = <T extends ReadonlyArray<unknown>>(values: T) => (
    <H extends ReadonlyArray<unknown>>(haystack: H): H => {
        const lookup = values.map((value) => value.toString())
            .filter(Boolean);

        return haystack.filter((needle) => needle !== null)
            .filter((needle) => !lookup.includes(needle.toString()))
            .filter((needle) => needle !== undefined) as unknown as H;
    }
);

export function pipe<A, B>(
    fn1: PipeFunction<A, B>
): PipeFunction<A, B>;
export function pipe<A, B, C>(
    fn1: PipeFunction<A, B>,
    fn2: PipeFunction<B, C>
): PipeFunction<A, C>;
export function pipe<A, B, C, D>(
    fn1: PipeFunction<A, B>,
    fn2: PipeFunction<B, C>,
    fn3: PipeFunction<C, D>,
): PipeFunction<A, D>;
export function pipe<A, B, C, D, E>(
    fn1: PipeFunction<A, B>,
    fn2: PipeFunction<B, C>,
    fn3: PipeFunction<C, D>,
    fn4: PipeFunction<D, E>,
): PipeFunction<A, E>;
export function pipe<A, B, C, D, E, F>(
    fn1: PipeFunction<A, B>,
    fn2: PipeFunction<B, C>,
    fn3: PipeFunction<C, D>,
    fn4: PipeFunction<D, E>,
    fn5: PipeFunction<E, F>,
): PipeFunction<A, F>;
export function pipe<A, B, C, D, E, F, G>(
    fn1: PipeFunction<A, B>,
    fn2: PipeFunction<B, C>,
    fn3: PipeFunction<C, D>,
    fn4: PipeFunction<D, E>,
    fn5: PipeFunction<E, F>,
    fn6: PipeFunction<F, G>,
): PipeFunction<A, G>;
export function pipe<A, B, C, D, E, F, G, H>(
    fn1: PipeFunction<A, B>,
    fn2: PipeFunction<B, C>,
    fn3: PipeFunction<C, D>,
    fn4: PipeFunction<D, E>,
    fn5: PipeFunction<E, F>,
    fn6: PipeFunction<F, G>,
    fn7: PipeFunction<G, H>,
): PipeFunction<A, H>;
export function pipe<A, B, C, D, E, F, G, H, I>(
    fn1: PipeFunction<A, B>,
    fn2: PipeFunction<B, C>,
    fn3: PipeFunction<C, D>,
    fn4: PipeFunction<D, E>,
    fn5: PipeFunction<E, F>,
    fn6: PipeFunction<F, G>,
    fn7: PipeFunction<G, H>,
    fn8: PipeFunction<H, I>,
): PipeFunction<A, I>;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
    fn1: PipeFunction<A, B>,
    fn2: PipeFunction<B, C>,
    fn3: PipeFunction<C, D>,
    fn4: PipeFunction<D, E>,
    fn5: PipeFunction<E, F>,
    fn6: PipeFunction<F, G>,
    fn7: PipeFunction<G, H>,
    fn8: PipeFunction<H, I>,
    fn9: PipeFunction<I, J>,
): PipeFunction<A, J>;
export function pipe<A, B, C, D, E, F, G, H, I, J>(
    fn1: PipeFunction<A, B>,
    fn2: PipeFunction<B, C>,
    fn3: PipeFunction<C, D>,
    fn4: PipeFunction<D, E>,
    fn5: PipeFunction<E, F>,
    fn6: PipeFunction<F, G>,
    fn7: PipeFunction<G, H>,
    fn8: PipeFunction<H, I>,
    fn9: PipeFunction<I, J>,
    ...fns: Array<PipeFunction<unknown, unknown>>
): PipeFunction<unknown, unknown>;

export function pipe (...fns: Array<PipeFunction<unknown | never, unknown | never>>) {
    return function (value: unknown) {
        return fns.reduce((acc, fn) => fn.bind(this)(acc), value);
    };
}

