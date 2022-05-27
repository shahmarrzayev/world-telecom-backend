module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true,
        'jest/globals': true,
    },
    extends: [
        'airbnb-base',
        'plugin:prettier/recommended',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
    },
    rules: {
        "indent": ["error", 4],
        "no-await-in-loop": "off",
        "no-param-reassign": "off",
        "no-plusplus": "off",
        "no-underscore-dangle": "off",
    },
    plugins: [
        'jest',
        'prettier',
    ],
};
