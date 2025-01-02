<p align="center">
    <a href="https://github.com/sovrin/onia" target="_blank"><img src="https://raw.githubusercontent.com/sovrin/onia/master/doc/logo.png" width="201" alt="onia Logo"/></a>
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/onia"><img src="https://badgen.net/npm/v/onia" alt=""></a>
    <a href="https://www.npmjs.com/package/onia"><img src="https://badgen.net/npm/types/onia" alt=""></a>
    <a href="https://packagephobia.com/result?p=onia"><img src="https://badgen.net/packagephobia/install/onia" alt=""></a>
    <a href="https://coveralls.io/github/sovrin/onia?branch=master"><img src="https://coveralls.io/repos/github/sovrin/onia/badge.svg?branch=master" alt=""></a>
    <a href="https://snyk.io/test/github/sovrin/onia"><img src="https://snyk.io/test/github/sovrin/onia/badge.svg" alt=""></a>
    <a href="LICENSE"><img src="https://badgen.net/github/license/sovrin/onia" alt=""></a>
</p>

## About

**onia** is a lightweight library of monadic parser combinators for JavaScript and TypeScript.
It offers a versatile set of functions to create and combine parsers in a modular and composable manner.
These parsers are designed to process and interpret structured text, making them ideal for parsing programming languages, data formats, and other text-based protocols.

## Installation

```bash
$ npm i onia
```

## Usage

### Example

```ts
import onia, {
    regex,
    alpha,
    map,
    many,
    int,
    sequence,
    optional
} from 'onia';

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
    ] as const, true),
    'expression'
);

const result = onia('123 + 321', expression);
// result === [123, '+', 321]
```

## API: Parsers

### `alpha(char: string, expected?: string): Parser<string>`

Creates a parser that matches a specific character.

**Parameters:**

- `char` (string): The character to match.
- `expected` (string, optional): The name of the expected parser.

**Returns:**

- `Parser<string>`: A parser that matches the specified character.

**Example:**

```ts
const parser = alpha('a');
const result = parser({index: 0, text: 'abc'});
// result === 'a'
```

### `regex(pattern: RegExp, expected?: string): Parser<string>`

Creates a parser that matches a regular expression pattern.

**Parameters:**

- `pattern` (RegExp): The regular expression pattern to match.
- `expected` (string, optional): The name of the expected parser.

**Returns:**

- `Parser<string>`: A parser that matches the specified pattern.

**Example:**

```ts
const parser = regex(/\d+/);
const result = parser({index: 0, text: '123abc'});
// result === '123'
```

### `sequence(parsers: readonly Parser<T>[], expected?: string): Parser<T[]>`

Creates a parser that matches a sequence of parsers.

**Parameters:**

- `parsers` (readonly Parser<T>[]): The parsers to match in sequence.
- `expected` (string, optional): The name of the expected parser.

**Returns:**

- `Parser<T[]>`: A parser that matches the sequence of input parsers.

**Example:**

```ts
const parser = sequence([alpha('a'), alpha('b'), alpha('c')]);
const result = parser({index: 0, text: 'abc'});
// result === ['a', 'b', 'c']
```

### `any(parsers: readonly Parser<T>[], expected?: string): Parser<T>`

Creates a parser that matches any one of the provided parsers.

**Parameters:**

- `parsers` (readonly Parser<T>[]): The parsers to match.
- `expected` (string, optional): The name of the expected parser.

**Returns:**

- `Parser<T>`: A parser that matches any one of the input parsers.

**Example:**

```ts
const parser = any([alpha('a'), alpha('b')]);
const result = parser({index: 0, text: 'bcd'});
// result === 'b'
```

### `optional(parser: Parser<T>, defaultValue?: T, expected?: string): Parser<T | undefined>`

Creates a parser that optionally matches another parser.

**Parameters:**

- `parser` (Parser<T>): The parser to optionally match.
- `defaultValue` (T, optional): The default value if the parser does not match.
- `expected` (string, optional): The name of the expected parser.

**Returns:**

- `Parser<T | undefined>`: A parser that optionally matches the input parser.

**Example:**

```ts
const parser = optional(alpha('a'));
const result = parser({index: 0, text: 'bcd'});
// result === undefined
```

### `many(parser: Parser<T>, expected?: string): Parser<T[]>`

Creates a parser that matches zero or more occurrences of another parser.

**Parameters:**

- `parser` (Parser<T>): The parser to match multiple times.
- `expected` (string, optional): The name of the expected parser.

**Returns:**

- `Parser<T[]>`: A parser that matches zero or more occurrences of the input parser.

**Example:**

```ts
const parser = many(alpha('a'));
const result = parser({index: 0, text: 'aaabc'});
// result === ['a', 'a', 'a']
```

### `map(parser: Parser<T>, transform: (value: T) => U, expected?: string): Parser<U>`

Creates a parser that transforms the result of another parser.

**Parameters:**

- `parser` (Parser<T>): The parser to transform.
- `transform` (function): The transformation function.
- `expected` (string, optional): The name of the expected parser.

**Returns:**

- `Parser<U>`: A parser that transforms the result of the input parser.

**Example:**

```ts
const parser = map(alpha('a'), (char) => char.toUpperCase());
const result = parser({index: 0, text: 'abc'});
// result === 'A'
```

### `lazy<T>(parserFactory: () => Parser<T>, expected?: string): Parser<T>`

Creates a parser that is lazily evaluated.

**Parameters:**

- `parserFactory` (function): A function that returns the parser to be evaluated.
- `expected` (string, optional): The name of the expected parser.

**Returns:**

- `Parser<T>`: A lazily evaluated parser.

**Example:**

```ts
const parser = lazy(() => alpha('a'));
const result = parser({index: 0, text: 'abc'});
// result === 'a'
```

## API: Helpers

### `flatten(): (haystack: T) => FlattenArray<T>`

Flattens a nested array by one level.

**Example:**

```ts
const flattenArray = flatten();
const result = flattenArray([['a', 'b'], ['c', 'd']]);
// result === ['a', 'b', 'c', 'd']
```

### `pop(): (haystack: T) => LastElement<T>`

Returns the last element of an array.

**Example:**

```ts
const popElement = pop();
const result = popElement(['a', 'b', 'c']);
// result === 'c'
```

### `shift(): (haystack: T) => FirstElement<T>`

Returns the first element of an array.

**Example:**

```ts
const shiftElement = shift();
const result = shiftElement(['a', 'b', 'c']);
// result === 'a'
```

### `join(): (haystack: T) => string`

Joins all elements of an array into a string.

**Example:**

```ts
const joinElements = join();
const result = joinElements(['a', 'b', 'c']);
// result === 'abc'
```

### `expand(): <T>(...haystack: T) => ReadonlyArray<T>`

Expands the elements of an array.

**Example:**

```ts
const expandElements = expand();
const result = expandElements(1, 2, 3);
// result === [1, 2, 3]
```

### `zip(mapper: (parser: Parser<V>, value: T) => R): (values: ReadonlyArray<T>) => ReadonlyArray<R>`

Maps each element of an array using a provided function.

**Example:**

```ts
const stringParser = alpha('foo');
const numberParser = map(regex(/\d/g), int());

const zipParser = map(
    sequence([numberParser, stringParser, numberParser] as const),
    zip((parser, value) => {
        if (parser === stringParser) {
            value = '2';
        }
        return value;
    })
);

const result = zipParser({index: 0, text: '1foo3'});
// result === [1, '2', 3]
```

### `int(): (number: string) => number`

Parses a string as an integer.

**Example:**

```ts
const parseInt = int();
const result = parseInt('123');
// result === 123
```

### `float(): (number: string) => number`

Parses a string as a float.

**Example:**

```ts
const parseFloat = float();
const result = parseFloat('123.45');
// result === 123.45
```

### `filter(values: T, strict: boolean = false): (haystack: H) => H`

Filters out specified values from an array.

**Parameters:**

- `values` (T): Values to filter out.
- `strict` (boolean, optional): Filter falsy values out.

**Example:**

```ts
const filterValues = filter([alpha('a'), 'b']);
const result = filterValues(['a', 'b', null, 'c', 'd'] as const, true);
// result === ['c', 'd']
```

### `pipe(...fns: Function[]): Function`

Composes multiple functions into a single function.

**Example:**

```ts
const pipeline = pipe(
    (number: number) => number + 1,
    (number: number) => number * 2,
    (number: number) => number.toString(),
    join()
);
const result = pipeline([1, 2, 3]);
// result === '468'
```

## Disclaimer

This project is still in early development and is subject to change.

## Licence

MIT License, see [LICENSE](./LICENSE)
