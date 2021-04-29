export type Parser<T> = (context: Context) => Result<T>;

export type Result<T> = Success<T> | Failure;

export type Success<T> = Readonly<{
    success: true;
    value: T;
    context: Context;
}>;

export type Failure = Readonly<{
    success: false;
    expected: string;
    context: Context;
}>;

export type Context = Readonly<{
    text: string;
    index: number;
}>;
