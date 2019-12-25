const { join } = require('path');
const { DefinePlugin } = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

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
      warningsFilter: [/node-pty/],
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
          exclude: /(node_modules)|(data)/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
            },
          },
        },
        {
          test: /\.node$/,
          use: 'node-loader',
        },
        // In Windows, blessed requires some files for terminals in runtime
        // This just fixes the routes so they are kept inside the `app` target folder
        {
          test: join(__dirname, 'node_modules', 'blessed', 'lib', 'tput.js'),
          loader: 'string-replace-loader',
          options: {
            search: "__dirname \\+ '/../usr/",
            replace: "__dirname + '/usr/",
            flags: 'g',
          },
        },
      ],
    },

    plugins: [
      new GitRevisionPlugin(),
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
      // Copy the files required by blessed in runtime into the target `app` folder:
      new CopyPlugin([
        { from: join(__dirname, 'node_modules', 'blessed', 'usr'), to: 'usr' },
      ]),
    ].concat(isProd ? [new CleanWebpackPlugin()] : []),
  };
};
