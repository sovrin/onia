<h1 align="left">onia</h1>

[![npm version][npm-src]][npm-href]
[![types][types-src]][types-href]
[![size][size-src]][size-href]
[![coverage][coverage-src]][coverage-href]
[![vulnerabilities][vulnerabilities-src]][vulnerabilities-href]
[![dependencies][dep-src]][dep-href]
[![devDependencies][devDep-src]][devDep-href]
[![License][license-src]][license-href]

> small set of monadic parser combinators.

## Installation
```bash
$ npm i onia
```

## Usage
```js
import onia, {regex, alpha, map, many, sequence, optional} from 'onia';

const digit = map(
    regex(/[0-9]/g, 'digit'),
    (digit) => parseInt(digit)
);
const digits = map(
    many(digit),
    (digit) => parseInt(digit.join(''))
);
const whitespace = alpha(' ');
const operator = regex(/[+-]/g, 'operator');
const term = map(
    sequence<any>([digits, optional(whitespace), operator, optional(whitespace), digits]),
    ([left, , operator, , right]) => [left, operator, right],
);

const [left, operator, right] = onia('123 + 321', term);

// left === 123
// operator === +
// right === 321
```

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
[dep-src]: https://badgen.net/david/dep/sovrin/onia
[dep-href]: https://badgen.net/david/dep/sovrin/onia
[devDep-src]: https://badgen.net/david/dev/sovrin/onia
[devDep-href]: https://badgen.net/david/dev/sovrin/onia
[license-src]: https://badgen.net/github/license/sovrin/onia
[license-href]: LICENSE
