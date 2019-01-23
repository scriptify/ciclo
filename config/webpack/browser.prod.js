const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const cssnano = require('cssnano');

const createCommonConfig = require('./browser.common');

const {
  PATHS, loadCSS, createAnalyzer, createLinter
} = require('./util.js');

const PROD_CONFIG = {
  mode: 'production',
  module: {
    rules: [
      createLinter(false),
      loadCSS({ use: [MiniCssExtractPlugin.loader] })
    ],
  },
  plugins: [
    new CleanWebpackPlugin([PATHS.build]),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:4].css',
    }),
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: {
        discardComments: {
          removeAll: true
        },
        // Run cssnano in safe mode to avoid
        // potentially unsafe transformations.
        safe: true
      },
      canPrint: false
    }),
    // PurifyCSS doesn't work with react-select for some reason :( fix that asap
    // new PurifyCSSPlugin({
    //  paths: glob.sync(`${PATHS.client.app}/**/*.js*`, { nodir: true}),
    //  purifyOptions: { whitelist: ['*leaflet*', '*Select*', '*react-select*'] }
    // }),
    new webpack.BannerPlugin({
      banner: 'filename:[name]'
    }),
    new DuplicatePackageCheckerPlugin(),
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } }),
    createAnalyzer(false)
  ],
  optimization: {
    splitChunks: {
      chunks: 'initial'
    },
    minimizer: [new TerserPlugin()],
    runtimeChunk: {
      name: 'manifest'
    },
  }
};

module.exports = function create() {
  return merge(createCommonConfig(), PROD_CONFIG);
};
