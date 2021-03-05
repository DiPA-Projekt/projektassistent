const config = require('@leanup/stack/.eslintrc');

config.rules['@typescript-eslint/explicit-member-accessibility'] = ['error'];

config.parserOptions = {
  project: ['tsconfig.json'],
  tsconfigRootDir: __dirname,
  createDefaultProgram: true,
};

module.exports = config;
