const { join } = require('path');
const { DefinePlugin } = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

let constants;
try {
  constants = require('./constants');
} catch (e) {
  constants = {};
}

module.exports = env => {
  const isProd = env !== 'dev';

  return {
    mode: isProd ? 'production' : 'development',
    watch: !isProd,
    devtool: isProd ? undefined : 'source-map',

    entry: {
      index: join(__dirname, 'src', 'index.ts'),
    },
    output: {
      path: join(__dirname, 'app'),
    },

    stats: {
      assetsSort: 'name',
      modules: false,
      children: false,
      excludeAssets: [/hot(-update)?\.js(on)?/, /webpack-dev-server/],
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })],
    },

    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
    },

    optimization: {
      minimize: isProd,
      namedModules: !isProd,
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
            },
          },
        },
      ],
    },

    plugins: [
      new DefinePlugin({
        ...(() => {
          const c = { ...constants };
          Object.keys(c).forEach(k => {
            c[k] = JSON.stringify(c[k]);
          });
          return c;
        })(),
        NODE_ENV: JSON.stringify(isProd ? 'production' : 'development'),
        IS_PRODUCTION: isProd,
      }),
    ].concat(isProd ? [new CleanWebpackPlugin()] : []),
  };
};
