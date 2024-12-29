import onia, {alpha, any, lazy, many, map, optional, regex, sequence} from "../src";

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

    return map(
        sequenceParser,
        ([, expr,]) => parseFloat(expr as any) as number,
        'parentheses'
    );
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
console.log(result); // result === 13
