import onia, {
    alpha,
    any,
    filter,
    flatten,
    float,
    int,
    join,
    expand,
    many,
    map,
    optional,
    pipe,
    pop,
    regex,
    sequence,
    shift,
} from '../src';
import {assertType} from './utils';
import {Parser} from "../src";
import {isSuccess} from "../src/utils";

describe('onia', () => {
    describe('types', () => {
        const string = alpha('string');
        const digit = regex(/\d/g);
        const number = map(
            digit,
            int(),
        );

        describe('utils', () => {
            it('should pass generic type check', () => {
                const result = string({index: 0, text: 'foobar'});

                assertType(
                    isSuccess<string>(result)
                )
            })
        });

        describe('parsers', () => {
            it('should pass generic type check', () => {
                assertType<string>(
                    onia<string>('string', string)
                )
            });

            it('should pass type check', () => {
                assertType<Parser<string>>(
                    string
                );
                assertType<Parser<string>>(
                    digit
                );
                assertType<Parser<number>>(
                    number
                );
                assertType<Parser<string[]>>(
                    sequence([
                        string,
                    ])
                );
                assertType<Parser<string[]>>(
                    sequence([
                        string,
                        string,
                    ])
                );
                assertType<Parser<(string | number)[]>>(
                    sequence([
                        string,
                        number,
                    ])
                );
                assertType<Parser<readonly [string]>>(
                    sequence([
                        string,
                    ] as const)
                );
                assertType<Parser<readonly [string, number, string]>>(
                    sequence([
                        string,
                        number,
                        string
                    ] as const)
                );
                assertType<Parser<unknown>>(
                    any([])
                );
                assertType<Parser<string>>(
                    any([
                        string,
                    ])
                );
                assertType<Parser<string | number>>(
                    any([
                        number,
                        string,
                    ])
                );
                assertType<Parser<string | number>>(
                    any([
                        number,
                        string,
                        number,
                    ])
                );
                assertType<Parser<string>>(
                    optional(string)
                );
                assertType<Parser<number>>(
                    optional(number)
                );
                assertType<Parser<readonly string[]>>(
                    many(string)
                );
                assertType<Parser<readonly number[]>>(
                    many(number)
                );
                assertType<Parser<number>>(
                    map(
                        digit,
                        (d) => parseInt(d),
                    )
                );
            })
        });

        describe('helpers', () => {
            it('should pass type check', () => {
                const foo = alpha('foo');

                sequence([
                    optional(foo),
                ]);

                assertType<(number | string)[]>(
                    flatten()([
                        [123],
                        ['foobar'],
                    ])
                )
                assertType<string | number>(
                    pop()(
                        ['foobar', 123]
                    )
                )
                assertType<number>(
                    pop()(
                        ['foobar', 123] as const
                    )
                )
                assertType<string>(
                    pop()(
                        [123, 'string'] as const
                    )
                )
                assertType<string | number>(
                    pop()(
                        ['foobar', 123]
                    )
                )
                assertType<string | number>(
                    shift()(
                        ['foobar', 123]
                    )
                )
                assertType<string>(
                    shift()(
                        ['foobar', 123,] as const
                    )
                )
                assertType<number>(
                    shift()(
                        [123, 'foobar'] as const
                    )
                )
                assertType<string>(
                    join()([1, 2, 3])
                )
                assertType<readonly string[][]>(
                    expand()(
                        ['foobar'],
                    )
                )
                assertType<readonly (number | string)[][]>(
                    expand()(
                        [1, 2, 3] as const,
                        [1, 2, 3] as const,
                        ['foobar'] as const,
                    )
                )
                assertType<number>(
                    int()('1')
                )
                assertType<number>(
                    float()('1')
                )
                assertType<string[]>(
                    filter([

                        'foobar',
                    ])([
                        'foobar'
                    ])
                )
                assertType<string[]>(
                    filter([
                        123,
                        'foobar',
                    ])([
                        'foobar',
                    ])
                )
                assertType<Parser<string>>(
                    map(
                        foo,
                        pipe(
                            (v) => v,
                        ),
                    )
                );
                assertType<Parser<number>>(
                    map(
                        foo,
                        pipe(
                            (_v: string) => "foobar",
                            (_v) => 1,
                        ),
                    )
                );
                assertType<Parser<number>>(
                    map(
                        foo,
                        pipe(
                            (v: string) => v,
                            (v) => v,
                            (_v) => 2,
                        ),
                    ));
                assertType(
                    map(
                        foo,
                        pipe(
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                        ),
                    )
                );
                assertType<Parser<number>>(
                    map(
                        foo,
                        pipe(
                            (v: string) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (_v) => 2,
                        ),
                    )
                );
                assertType<Parser<string>>(
                    map(
                        foo,
                        pipe(
                            (v: string) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                        ),
                    ));
                assertType<Parser<string>>(
                    map(
                        foo,
                        pipe(
                            (v: string) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                        ),
                    ));
                assertType<Parser<number>>(
                    map(
                        foo,
                        pipe(
                            (v: string) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (_v) => 123,
                        ),
                    ));
                assertType<Parser<string>>(
                    map(
                        foo,
                        pipe(
                            (v: string) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                        ),
                    )
                );
                assertType<Parser<unknown>>(
                    map(
                        foo,
                        pipe(
                            (v: string) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (_v) => 1,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                            (v) => v,
                        )
                    )
                );
            })
        })
    })
});
