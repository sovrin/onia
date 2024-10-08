import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    files: ['** /*.ts'],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
    ],
    rules: {
        '@typescript-eslint/no-namespace': 'off',
        'indent': [
            'warn',
            4,
        ],
        'quotes': [
            'warn',
            'single',
        ],
        'space-before-function-paren': [
            'warn',
            'always',
        ],
        'curly': [
            'warn',
            'all',
        ],
        '@typescript-eslint/array-type': [
            'warn',
            {
                'default': 'generic',
            },
        ],
        '@typescript-eslint/method-signature-style': [
            'warn',
            'property',
        ],
        'array-bracket-newline': [
            'warn',
            {
                'multiline': true,
            },
        ],
        'eol-last': [
            'warn',
        ],
        'arrow-spacing': 'warn',
        'arrow-parens': 'warn',
        'comma-dangle': [
            'warn',
            'always-multiline',
        ],
        'function-call-argument-newline': [
            'warn',
            'consistent',
        ],
        'function-paren-newline': [
            'warn',
            'multiline',
        ],
        'multiline-ternary': [
            'warn',
            'always',
        ],
        'no-multi-spaces': [
            'warn',
        ],
        'no-multiple-empty-lines': [
            'warn',
            {
                'max': 1,
            },
        ],
        'no-trailing-spaces': [
            'warn',
        ],
        'no-whitespace-before-property': [
            'warn',
        ],
        'object-curly-newline': [
            'warn',
            {
                'consistent': true,
            },
        ],
        'operator-linebreak': [
            'warn',
            'before',
        ],
        'padded-blocks': [
            'warn',
            'never',
        ],
        'padding-line-between-statements': [
            'warn',
            {
                'blankLine': 'always',
                'prev': '*',
                'next': 'return',
            },
        ],
        'semi': [
            'warn',
            'always',
        ],
    },
});
