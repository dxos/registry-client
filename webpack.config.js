//
// Copyright 2019 Wireline, Inc.
//

const path = require('path');

const webpack = require('webpack');

module.exports = {
  target: 'web',

  mode: 'development',

  stats: 'errors-only',

  // Source map shows the original source and line numbers (and works with hot loader).
  // https://webpack.github.io/docs/configuration.html#devtool
  devtool: '#source-map',

  // https://webpack.js.org/configuration/resolve
  resolve: {
    extensions: ['.js'],

    // Resolve imports/requires.
    modules: ['node_modules']
  },

  entry: {
    app: [path.resolve('./src/index.js')]
  },

  output: {
    path: path.resolve('./dist/'),
    filename: 'registry.js',
    library: 'registry',
    libraryTarget: 'umd'
  },

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
          loader: 'babel-loader'
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
