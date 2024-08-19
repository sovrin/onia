import {Context, Failure, Success} from './types';

export function success<T>(context: Context, value: T): Success<T> {
    return ({
        success: true,
        value,
        context,
    });
}

export function failure(context: Context, expected: string | Array<string>): Failure {
    const {name} = this || {name: ''};

    expected = Array.isArray(expected)
        ? expected
        : [expected];

    expected = `${name}(${expected.filter(Boolean).join(', ')})`;

    return ({
        success: false,
        expected,
        context,
    });
}
