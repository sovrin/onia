import assert from 'assert';
import onia, {
    alpha,
    any,
    failure,
    int,
    lazy,
    many,
    map,
    pipe,
    filter,
    optional,
    regex,
    sequence,
    success,
} from '../src';
import {assertFailure, assertSuccess} from './utils';
import {Context, Failure, Parser, Result, Success} from "../src";

describe('onia', () => {
    const foo = alpha('foo', 'foo');
    const bar = alpha('bar', 'bar');

    describe('success', () => {
        describe('with undefined value', () => {
            it('should return expected values', () => {
                const result = success(null, null);

                assert.equal(result.value, null);
                assert.equal(result.success, true);
                assert.equal(result.context, null);
            })
        });

        describe('with value', () => {
            it('should return expected values', () => {
                const result = success(null, 'value');

                assert.equal(result.value, 'value');
                assert.equal(result.success, true);
                assert.equal(result.context, null);
            })
        });
    });

    describe('failure', () => {
        describe('with undefined value', () => {
            it('should return expected values', () => {
                const result = failure(null, null);

                assert.equal(result.success, false);
                assert.equal(result.expected, '()');
                assert.equal(result.context, null);
            })
        });

        describe('with value', () => {
            it('should return expected values', () => {
                const result = failure(null, 'value');

                assert.equal(result.success, false);
                assert.equal(result.expected, '(value)');
                assert.equal(result.context, null);
            })
        })
    });

    describe('alpha', () => {
        describe('', () => {
        })

        describe('success', () => {
            const parser = alpha('o');

            it('should parse string', () => {
                const result = parser({index: 0, text: 'o'});

                assertSuccess(result, 'o')
            });

            it('should return stringified value', () => {
                const result = parser.toString()

                assert.equal(result, 'o');
            })
        })

        describe('failure', () => {
            it('should return expected value', () => {
                const parser = alpha('o', 'foobar');

                {
                    const result = parser({index: 1, text: 'o'});

                    assertFailure(result, '[Parser alpha](foobar)');
                }
                {
                    const result = parser({index: -1, text: 'o'});

                    assertFailure(result, '[Parser alpha](foobar)');
                }
                {
                    const result = parser({index: 0, text: ''});

                    assertFailure(result, '[Parser alpha](foobar)');
                }
            })
        })
    });

    describe('regex', () => {
        describe('success', () => {
            it('should parse regex', () => {
                const parser = regex(/[0-9]/g);

                {
                    const result = parser.toString()

                    assert.equal(result, (/[0-9]/g).toString())
                }
                {
                    const result = parser({index: 0, text: '01'});

                    assertSuccess(result, '0');
                }
                {
                    const result = parser({index: 1, text: '01'});

                    assertSuccess(result, '1');
                }
            })
        });

        describe('failure', () => {
            it('should return expected value', () => {
                const parser = regex(/[0-9]/g, 'number');

                {
                    const result = parser({index: 0, text: ''});

                    assertFailure(result, '[Parser regex](number)');
                }
                {
                    const result = parser({index: 0, text: 'a'});

                    assertFailure(result, '[Parser regex](number)');
                }
            })
        })
    });

    describe('any', () => {
        describe('success', () => {
            it('should parse first', () => {
                const parser = any([foo]);
                const result = parser({index: 0, text: 'foo'});

                assertSuccess(result, 'foo');
            });

            it('should parse second', () => {
                const parser = any([foo, bar]);
                const result = parser({index: 0, text: 'bar'});

                assertSuccess(result, 'bar');
            });

            it('should parse first of two', () => {
                const parser = any([foo, bar]);
                const result = parser({index: 0, text: 'foo bar'});

                assertSuccess(result, 'foo');
            });
        })
        describe('failure', () => {
            it('should parse nothing', () => {
                const parser = any([], 'nothing');
                const result = parser({index: 0, text: 'foo'});

                assertFailure(result, '[Parser any](nothing)');
            });

            it('should parse none', () => {
                const parser = any([bar, foo], 'bar foo');
                const result = parser({index: 1, text: 'foo bar'});

                assertFailure(result, '[Parser any](bar foo)');
            });
        })
    });

    describe('many', () => {
        describe('success', () => {
            it('should parse none', () => {
                const parser = many(foo);
                const result = parser({index: 0, text: ''});

                assertSuccess(result, []);
            });

            it('should parse one', () => {
                const parser = many(foo);
                const result = parser({index: 0, text: 'foo'});

                assertSuccess(result, ['foo']);
            });
        });

        describe('failure', () => {
            it('should parse several', () => {
                const parser = many(foo);

                {
                    const result = parser({index: 0, text: 'foofoofoo'});

                    assertSuccess(result, ['foo', 'foo', 'foo']);
                }
                {
                    const result = parser({index: 1, text: 'foofoofoo'});

                    assertSuccess(result, []);
                }
                {
                    const result = parser({index: 0, text: 'bar'});

                    assertSuccess(result, []);
                }
                {
                    const result = parser({index: 0, text: 'foobar'});

                    assertSuccess(result, ['foo']);
                }
            })
        });
    });

    describe('optional', () => {
        describe('success', () => {
            it('should return null', () => {
                const parser = optional(foo);
                const result = parser({index: 0, text: ''});

                assertSuccess(result, null);
            });

            it('should return foo', () => {
                const parser = optional(foo);
                const result = parser({index: 0, text: 'foo'});

                assertSuccess(result, 'foo');
            });

            it('should return number', () => {
                const parser = optional(map(
                    regex(/\d/g, 'digit'),
                    int(),
                ));
                const result = parser({index: 0, text: '0'});

                assertSuccess(result, 0);
            });

            it('should drop optional foo', () => {
                const parser = optional(foo, false);
                const result = parser({index: 0, text: 'foo'});

                assertSuccess(result, null);
            });
        });
        describe('failure', () => {
            // can't fail?
        })
    });

    describe('map', () => {
        describe('success', () => {
            it('should map foo', () => {
                let v = '';
                const parser = map(foo, (val) => {
                    v = val;
                })
                const result = parser({index: 0, text: 'foo'});

                assertSuccess(result, undefined);
                assert(v === 'foo');
            });
        });

        describe('failure', () => {
            it('should map nothing', () => {
                let v: unknown;
                const parser = map(foo, (val) => {
                    v = val;
                }, 'nothing')
                const result = parser({index: 0, text: ''});

                assertFailure(result, '[Parser map](nothing, [Parser alpha](foo))');
                assert(v === undefined);
            });

            it('should return expected values', () => {
                const parser = map(
                    foo,
                    () => {
                        throw new Error('not implemented')
                    },
                    'foobar'
                );
                const result = parser({index: 0, text: 'bar'});

                assertFailure(result, '[Parser map](foobar, [Parser alpha](foo))');
            });
        })
    });

    describe('sequence', () => {
        describe('success', () => {
            it('should sequence nothing', () => {
                const fn = sequence([]);
                const result = fn({index: 0, text: 'foo'});

                assertSuccess(result, []);
            });

            it('should sequence strings', () => {
                const fn = sequence([foo, bar]);
                const result = fn({index: 0, text: 'foobar'});

                assertSuccess(result, ['foo', 'bar']);
            });

            it('should return expected values', () => {
                const fn = sequence([foo, bar]);
                const result = fn({index: 0, text: 'foo'}) as Failure;

                assert(result.success === false);
                assert(result.expected === '[Parser sequence]([Parser alpha](bar))');
            });
        });

        describe('failure', () => {
            it('should fail at incomplete sequence', () => {
                const fn = sequence([foo, bar], 'asa');
                const result = fn({index: 0, text: 'foo'});

                assertFailure(result, '[Parser sequence](asa, [Parser alpha](bar))');
            });
        });
    });

    describe('lazy', () => {
        it('should delay parser evaluation', () => {
            let parserInvoked = false;
            const mockParser: Parser<string> = (context: Context): Result<string> => {
                parserInvoked = true;
                return {success: true, value: 'test', context};
            };

            const lazyParser = lazy(() => mockParser);
            assert.strictEqual(parserInvoked, false, 'Parser should not be invoked yet');

            const result = lazyParser({text: '', index: 0}) as Success<string>;
            assert.strictEqual(parserInvoked, true, 'Parser should have been invoked');
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.value, 'test');
        });

        it('should create the parser only once', () => {
            let creationCount = 0;
            const mockParserFactory = () => {
                creationCount++;
                return (context: Context): Result<string> => ({success: true, value: 'test', context});
            };

            const lazyParser = lazy(mockParserFactory);
            lazyParser({text: '', index: 0});
            lazyParser({text: '', index: 1});

            assert.strictEqual(creationCount, 1, 'Parser should be created only once');
        });
    });

    describe('names', () => {
        it('should return expected parser names', () => {
            {
                const result = alpha(null);

                assert.equal(result.name, '[Parser alpha]');
            }
            {
                const result = regex(null);

                assert.equal(result.name, '[Parser regex]');
            }
            {
                const result = sequence(null);

                assert.equal(result.name, '[Parser sequence]');
            }
            {
                const result = any(null);

                assert.equal(result.name, '[Parser any]');
            }
            {
                const result = optional(null);

                assert.equal(result.name, '[Parser optional]');
            }
            {
                const result = many(null);

                assert.equal(result.name, '[Parser many]');
            }
            {
                const result = map(null, null);

                assert.equal(result.name, '[Parser map]');
            }
        });
    });

    describe('export', () => {
        it('should export the used parsers', () => {
            {
                const result = sequence([
                    foo,
                    bar,
                ]);

                assert.deepEqual(result.export(), [
                    foo,
                    bar
                ]);
            }

            {
                const result = any([
                    foo,
                    bar,
                ]);

                assert.deepEqual(result.export(), [
                    foo,
                    bar
                ]);
            }

            {
                const result = many(foo);

                assert.deepEqual(result.export(), foo);
            }

            {
                const result = optional(foo);

                assert.deepEqual(result.export(), foo);
            }

            {
                const result = map(bar, () => {});

                assert.deepEqual(result.export(), bar);
            }
        });
    });

    describe('example', () => {
        describe('simple', () => {
            const digit = map(
                regex(/\d/g, 'digit'),
                int(),
                'digit'
            );
            const digits = map(
                many(digit),
                (digit) => parseInt(digit.join('')),
                'digits'
            );
            const whitespace = alpha(' ', 'whitespace');
            const optionalWhitespace = optional(whitespace, false);
            const operator = regex(/[+-]/g, 'operator');

            const expression = map(
                sequence([
                    digits,
                    optionalWhitespace,
                    operator,
                    optionalWhitespace,
                    digits
                ] as const),
                filter([
                    optionalWhitespace
                ]),
                'expression'
            );

            it('should parse simple expression', () => {
                const [left, operator, right] = onia('123 + 321', expression);

                assert(left === 123);
                assert(operator === '+');
                assert(right === 321);
            });

            it('should throw error', () => {
                assert.throws(() => onia('foo / bar', expression));
            });
        });

        describe('complex', () => {
            const digit = map(
                regex(/\d*\.?\d*/g, 'digit'),
                (digit) => parseFloat(digit),
                'digit'
            );
            const whitespace = optional(alpha(' ', 'whitespace'), false);
            const operator = regex(/[+\-*/]/g, 'operator');
            const expression = lazy<number>(() => map(
                sequence([
                    term,
                    many(sequence([whitespace, operator, whitespace, term] as const, 'expression'))
                ] as const),
                ([first, rest]) => rest.reduce((acc, [, op, , next]) => {
                    if (op === '+') return acc + parseFloat(next as any);
                    if (op === '-') return acc - parseFloat(next as any);

                    return acc;
                }, first as number),
                'expression'
            ));
            const parentheses = lazy(() => {
                const sequenceParser = sequence([
                    alpha('('),
                    expression,
                    alpha(')')
                ] as const);

                const mappedParser: Parser<number> = map(
                    sequenceParser,
                    ([, expr,]) => parseFloat(expr as any) as number,
                    'parentheses'
                );

                return mappedParser;
            });
            const term = map(
                sequence([
                    any([parentheses, digit] as const),
                    many(sequence([whitespace, operator, whitespace, any([parentheses, digit] as const)] as const, 'term'))
                ] as const),
                ([first, rest]) => rest.reduce((acc, [, op, , next]) => {
                    if (op === '*') return acc * parseFloat(next as any);
                    if (op === '/') return acc / parseFloat(next as any);
                    if (op === '+') return acc + parseFloat(next as any);
                    if (op === '-') return acc - parseFloat(next as any);

                    return acc;
                }, first as number),
                'term'
            );

            it('should parse expression', () => {
                assert.equal(onia('1 * 1', expression), 1);
                assert.equal(onia('0.5 * 1', expression), 0.5);
                assert.equal(onia('123 + 321', expression), 444);
                assert.equal(onia('5 / (2 + 3)', expression), 1);
                assert.equal(onia('(2 * (3 + 4)) - (5 / (2 + 3))', expression), 13);
            });

            it('should return NaN', () => {
                const result = onia('foo / bar', expression);
                assert.ok(isNaN(result));
            });
        });
    });
});
