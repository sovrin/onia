import {
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
    zip,
} from '../src';
import {assertSuccess} from './utils';

describe('onia', () => {
    describe('helpers', () => {
        describe('int', () => {
            const string = map(
                regex(/.*/g, 'string'),
                int(),
            );

            it('should cast value to int', () => {
                const result = string({index: 0, text: '0.12'});

                assertSuccess(result, 0);
            });
        });

        describe('float', () => {
            const parser = map(
                regex(/.*/g, 'string'),
                float(),
            );

            it('should cast value to float', () => {
                const result = parser({index: 0, text: '0.12'});

                assertSuccess(result, 0.12);
            });
        });

        describe('shift', () => {
            const digit = map(
                regex(/\d/g, 'digit'),
                int(),
            );

            const parser = map(
                sequence([
                    digit,
                    digit,
                    digit,
                ]),
                shift(),
            );

            it('should get the first element', () => {
                const result = parser({index: 0, text: '123'});

                assertSuccess(result, 1);
            });
        });

        describe('pop', () => {
            const string = map(
                regex(/\d/g, 'digit'),
                int(),
            );

            const parser =
                map(
                    sequence([
                        string,
                        string,
                        string,
                    ]),
                    pop(),
                );

            it('should get the last element', () => {
                const result = parser({index: 0, text: '123'});

                assertSuccess(result, 3);
            });
        });

        describe('pipe', () => {
            const number = map(
                regex(/\d/g, 'digit'),
                int(),
            );

            const parser = map(
                sequence([
                    number,
                    number,
                    number,
                ]),
                pipe(
                    (v) => v.map((n) => n + 1),
                    (v) => v.join('_'),
                ),
            );

            it('should pipe value to each fn and transform', () => {
                const result = parser({index: 0, text: '123'});

                assertSuccess(result, '2_3_4');
            });
        });

        describe('flatten', () => {
            const character = any([
                regex(/[a-z]/ig, 'letter'),
                map(
                    regex(/\d/g, 'digit'),
                    int(),
                ),
            ]);

            const parser = map(
                sequence([
                    character,
                    optional(
                        many(
                            map(
                                sequence([
                                    character,
                                ]),
                                pop(),
                            ),
                        ),
                    ),
                ]),
                flatten(),
            );

            it('should flatten result value', () => {
                const result = parser({index: 0, text: 'foobar'});

                assertSuccess(result, ['f', 'o', 'o', 'b', 'a', 'r']);
            });
        });

        describe('join', () => {
            const letter = regex(/[a-z]/ig, 'letter');

            const digit = map(
                regex(/\d/g, 'digit'),
                int(),
            );

            const character = any([
                letter,
                digit,
            ]);

            const parser = map(
                sequence([
                    character,
                    map(
                        many(character),
                        join(),
                    )],
                ),
                join(),
            );

            it('should join result value', () => {
                const result = parser({index: 0, text: 'foo123bar'});

                assertSuccess(result, 'foo123bar');
            });
        });

        describe('filter', () => {
            const string = regex(/\w+/ig, 'string');
            const open = alpha('{');
            const close = alpha('}');
            const unused = alpha('_');
            const hashtag = alpha('#');

            it('should filter out strings and parsers', () => {
                const parser = map(
                    sequence([
                        open,
                        string,
                        close,
                    ]),
                    filter([
                        '{',
                        close,
                        unused
                    ] as const),
                );

                assertSuccess(parser({index: 0, text: '{foobar}'}), ['foobar']);
            });

            it('should strictly filter out empty values', () => {
                const parser = map(
                    sequence([
                        optional(open),
                        optional(hashtag),
                        string,
                        optional(close),
                    ]),
                    filter([], true),
                );
                assertSuccess(parser({index: 0, text: 'foobar'}), ['foobar']);
            })

            it('should filter out braces and ignore order', () => {
                const optionalHashtag = optional(hashtag, false);

                const parser = map(
                    sequence([
                        open,
                        optionalHashtag,
                        string,
                        close,
                    ]),
                    filter([
                        '{',
                        close,
                        hashtag
                    ] as const, true),
                );
                assertSuccess(parser({index: 0, text: '{foobar}'}), ['foobar']);
            });

            it('should filter out null', () => {
                const digit = regex(/\d/g, 'digit');
                const delimiter = alpha(',');
                const open = alpha('(');
                const close = alpha(')');
                const space = optional(
                    regex(/\s+/g, 'space'),
                    true
                );

                const parser = map(
                    sequence([
                        open,
                        space,
                        optional(digit),
                        space,
                        optional(
                            many(
                                map(
                                    sequence([
                                        delimiter,
                                        space,
                                        digit,
                                        space,
                                    ]),
                                    pipe(
                                        filter([
                                            delimiter,
                                        ] as const, true),
                                        pop(),
                                    ),
                                ),
                            ),
                        ),
                        close,
                    ]),
                    pipe(
                        filter([
                                open,
                                close,
                            ] as const,
                            true
                        ),
                        flatten(),
                    )
                );

                assertSuccess(parser({index: 0, text: '(1, 2,  3,   4)'}), ['1', '2', '3', '4']);
            });
        });

        describe('expand', () => {
            it('should expand values', () => {
                const string = map(
                    regex(/\d/g, 'digit'),
                    int(),
                );

                const parser = map(
                    sequence([
                        string,
                        string,
                        string,
                    ]),
                    expand()
                );

                const result = parser({index: 0, text: '123'});

                assertSuccess(result, [[1, 2, 3]]);
            })
        });

        describe('zip', () => {
            const string = alpha('foo');

            const number = map(
                regex(/\d/g, 'digit'),
                int(),
            );

            const parser = map(
                sequence([
                    number,
                    string,
                    number,
                ] as const),
                zip((parser, value) => {
                    if (parser === string) {
                        value = '2';
                    }

                    return value;
                })
            );

            const actual = parser({index: 0, text: '1foo3'});
            const expected = [1, '2', 3];

            assertSuccess(actual, expected);
        });
    })
});
