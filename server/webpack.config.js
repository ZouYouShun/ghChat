// @ts-nocheck

const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const path = require('path');

// function srcPath(subdir) {
//   return path.join(__dirname, subdir);
// }

const config = {
  mode: 'development',
  entry: './src/main.ts',
  target: 'node',
  output: {
    // Puts the output at the root of the dist folder
    path: path.join(__dirname, 'dist'),
    filename: 'index.js'
  },
  resolve: {
    alias: {
    },
    extensions: ['.ts', '.js'],
    modules: [
      'node_modules',
      'src',
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        test: /\.ts$/,
        ts: {
          compiler: 'typescript',
          configFileName: 'tsconfig.json'
        },
        tslint: {
          emitErrors: true,
          failOnHint: true
        }
      }
    }),
  ],
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'awesome-typescript-loader'
    }]
  },
  externals: [nodeExternals()]
};

module.exports = (env, argv) => {
  if (!argv.prod) {
    config.devtool = 'source-map';
  }

  config.resolve.alias = {
    '@env': path.join(__dirname, `src/environments/environment${argv.prod ? '.prod' : ''}.ts`),
  };
  return config;
};
