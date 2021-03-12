module.exports = (...args) => {
  const config = require('@leanup/stack-react/webpack.config')(...args);
  const CopyPlugin = require('copy-webpack-plugin');

  if (args[0].WEBPACK_BUILD) {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: 'public',
          },
        ],
      })
    );
  }

  return config;
};
