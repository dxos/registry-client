//
// Copyright 2019 Wireline, Inc.
//

const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
  target: 'web',

  mode,

  stats: 'errors-only',

  // Source map shows the original source and line numbers (and works with hot loader).
  // https://webpack.github.io/docs/configuration.html#devtool
  devtool: process.env.NODE_ENV !== 'production' ? '#source-map' : false,

  entry: {
    index: [path.resolve('./src/index.js')]
  },

  output: {
    path: path.resolve(__dirname, 'dist/umd'),
    filename: '[name].js',
    libraryTarget: 'umd'
  },

  externals: Object.keys(pkg.dependencies),

  // https://www.npmjs.com/package/html-webpack-plugin
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ].filter(Boolean),

  module: {
    rules: [
      // js/mjs
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { chrome: "60" } }]
            ]
          }
        }
      },

      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  }
};
