const path = require('path');
module.exports = {
  include: ['projects/projektassistent-frontend/src/**/*.js', 'projects/projektassistent-frontend/src/**/*.ts'],
  exclude: ['**/*.d.ts', '**/*.mocha.ts', '**/*.mock.ts', '**/*.spec.ts', '**/*.test.ts'],
  all: true,
  cache: false,
  reporter: ['html', 'lcovonly', 'text'],
  'report-dir': path.resolve(process.cwd(), 'coverage/projektassistent-frontend'),
  'temp-dir': path.resolve(process.cwd(), 'coverage/nyc'),
  require: ['esm', 'esbuild-register'],
  watermarks: {
    lines: [50, 75],
    functions: [50, 75],
    branches: [50, 75],
    statements: [50, 75],
  },
  sourceMap: false,
  instrument: true,
  statements: 50,
  branches: 50,
  functions: 50,
  lines: 50,
};
