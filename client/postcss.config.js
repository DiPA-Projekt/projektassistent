const config = require('@leanup/stack/postcss.config');

config.plugins.push(
  require('cssnano')({
    preset: 'default',
  })
);

module.exports = config;
