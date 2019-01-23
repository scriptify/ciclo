const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackNotifierPlugin = require('webpack-notifier');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const createCommonConfig = require('./browser.common');

const {
  PATHS, loadCSS, createAnalyzer, createLinter, getAppName
} = require('./util.js');

const DEV_CONFIG = {
  mode: 'development',
  devtool: 'cheap-eval-source-map',
  devServer: {
    contentBase: PATHS.build,
    historyApiFallback: true,
    quiet: true,
    hot: true,
    open: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new WebpackNotifierPlugin({
      excludeWarnings: true,
      title: getAppName()
    }),
    new FriendlyErrorsWebpackPlugin(),
    createAnalyzer(true)
  ],
  module: {
    rules: [
      createLinter(true),
      loadCSS({ use: ['style-loader'] })
    ]
  }
};

const CONF_TO_EXPORT = merge(createCommonConfig(), DEV_CONFIG);

module.exports = CONF_TO_EXPORT;
