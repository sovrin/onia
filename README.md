<h1 align="left">onia</h1>

[![npm version][npm-src]][npm-href]
[![types][types-src]][types-href]
[![size][size-src]][size-href]
[![coverage][coverage-src]][coverage-href]
[![vulnerabilities][vulnerabilities-src]][vulnerabilities-href]
[![License][license-src]][license-href]

> small set of monadic parser combinators.

## Installation
```bash
$ npm i onia
```

## Usage
### Simple example

```ts
import onia, {regex, alpha, map, many, sequence, optional} from 'onia';

const digit = map(
    regex(/\d/g, 'digit'),
    (digit) => parseInt(digit),
    'digit'
);
const digits = map(
    many(digit),
    (digit) => parseInt(digit.join('')),
    'digits'
);
const whitespace = alpha(' ', 'whitespace');
const operator = regex(/[+-]/g, 'operator');
const expression = map(
    sequence([digits, optional(whitespace), operator, optional(whitespace), digits] as const),
    ([left, , operator, , right]) => [left, operator, right] as const,
    'expression'
);

const result = onia('123 + 321', term);
// result === [123, '+', 321]
```

### Complex example
naive calculator parser adhering to the order of operations.

```ts
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
const result = onia('(2 * (3 + 4)) - (5 / (2 + 3))', expression);
// result === 13

```

## Disclaimer
This project is still in early development and is subject to change.

## Licence
MIT License, see [LICENSE](./LICENSE)

[npm-src]: https://badgen.net/npm/v/onia
[npm-href]: https://www.npmjs.com/package/onia
[size-src]: https://badgen.net/packagephobia/install/onia
[size-href]: https://packagephobia.com/result?p=onia
[types-src]: https://badgen.net/npm/types/onia
[types-href]: https://www.npmjs.com/package/onia
[coverage-src]: https://coveralls.io/repos/github/sovrin/onia/badge.svg?branch=master
[coverage-href]: https://coveralls.io/github/sovrin/onia?branch=master
[vulnerabilities-src]: https://snyk.io/test/github/sovrin/onia/badge.svg
[vulnerabilities-href]: https://snyk.io/test/github/sovrin/onia
[license-src]: https://badgen.net/github/license/sovrin/onia
[license-href]: LICENSE
