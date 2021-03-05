const config = require('@leanup/stack-vite/vite.config');

config.server.proxy = require('./proxy.conf.json');

module.exports = config;
