module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'standard'
  ],
  globals: {
    'A': 'readonly' // Aladin script
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    'camelcase': 'off',
    'eqeqeq': 'off',
    'brace-style': 'off',
    'quote-props': ['error', 'consistent'],
    'vue/require-prop-type-constructor': 'off',
    'vue/prop-name-casing': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/order-in-components': 'off',
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 'off',
    'vue/no-multiple-template-root': 'off',
    'new-cap': 'off',

    /* Don't automatically fix these when running `eslint --fix`, but keep the warning/error */

    // This autofix induced breaking changes when props are named with a mix of camelCase and snake_case,
    // such as in SiteCalendar by changing the prop for TheCalendar (fc_timeZone)
    // from 'fc_timeZone' to 'fc-time-zone'
    'vue/attribute-hyphenation': 'off'
  }
}
