const config = require('@leanup/stack/.eslintrc');

config.parserOptions = {
  project: ['tsconfig.json'],
  tsconfigRootDir: __dirname,
  createDefaultProgram: true,
};

module.exports = config;
