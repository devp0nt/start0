import baseConfig from '../../eslint.config.js'

/** @type {import('eslint').Linter.Config} */
export default [
  ...baseConfig,
  {
    files: baseConfig[0].files,
    ignores: baseConfig[0].ignores,
    rules: {
      // specify the rules
    },
  },
]
