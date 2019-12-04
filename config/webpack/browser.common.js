const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const path = require('path');
const { PATHS, getAppName, getAliases, createLinter } = require('./util.js');

module.exports = function create() {
  return {
    entry: ['@babel/polyfill', path.join(PATHS.src, 'index.tsx')],
    resolve: {
      extensions: [
        '.web.js',
        '.mjs',
        '.js',
        '.json',
        '.web.jsx',
        '.jsx',
        '.ts',
        '.tsx',
      ],
      alias: getAliases(),
    },
    output: {
      publicPath: '/',
      filename: '[name].[hash:4].js',
      path: PATHS.build,
      chunkFilename: '[name].[chunkhash:4].js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: getAppName(),
        template: path.join(PATHS.assets, 'index.html'),
      }),
      new StyleLintPlugin({
        context: PATHS.src,
        files: '**/*.css',
        fix: true,
      }),
    ],
    module: {
      rules: [
        {
          test: [/\.js$/, /\.jsx$/, /\.ts$/, /\.tsx$/],
          use: {
            loader: 'babel-loader',
          },
          include: [PATHS.src],
        },
        {
          test: /\.(jpg|png|svg|gif)$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 15000,
            },
          },
        },
        {
          test: /\.(ttf|eot|woff|woff2)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[hash:4].[ext]',
            },
          },
        },
        // createLinter({
        //   configFile: path.join(__dirname, '../../tslint.json'),
        //   tsConfigFile: path.join(__dirname, '../../tsconfig.json')
        // }),
      ],
    },
    performance: {
      hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    },
    node: {
      fs: 'empty',
      dns: 'empty',
      net: 'empty',
      tls: 'empty',
      module: 'empty',
    },
  };
};
