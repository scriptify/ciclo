const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const postcssPresetEnv = require('postcss-preset-env');
const path = require('path');

const PATHS = {
  src: path.resolve(__dirname, '../../src'),
  build: path.resolve(__dirname, '../../build'),
  assets: path.resolve(__dirname, '../../assets'),
};

function loadCSS({ use = [] }) {
  return {
    test: /\.css$/,
    include: [PATHS.src],
    use: [
      ...use,
      {
        loader: 'css-loader',
        options: {
          modules: true,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          plugins: () => [postcssPresetEnv()],
        },
      },
    ],
  };
}

function createAnalyzer(dev = true) {
  return new BundleAnalyzerPlugin({
    analyzerMode: dev ? 'server' : 'static',
    openAnalyzer: !dev,
    reportFilename: path.join(PATHS.build, '/reports/bundle-analysis.html'),
  });
}

function createLinter({ configFile, tsConfigFile }) {
  return {
    test: [/\.js$/, /\.jsx$/, /\.ts$/, /\.tsx$/],
    use: {
      loader: 'tslint-loader',
      options: {
        fix: true,
        emitError: true,
        failOnHint: true,
        configFile,
        tsConfigFile,
      },
    },
    enforce: 'pre',
    include: [PATHS.src],
  };
}

function getAppName() {
  return process.env.APP_PATH;
}

function getAliases() {
  return {};
}

module.exports = {
  PATHS,
  loadCSS,
  createAnalyzer,
  createLinter,
  getAppName,
  getAliases,
};
