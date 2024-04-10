module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended'
    ],
    rules: {
        'no-unused-vars': 'off',
        'vue/multi-word-component-names': 'off',
        'no-unreachable' : 'off'
    },
    env: {
        browser: true,
        node: true
    }
}