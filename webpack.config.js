const { join } = require('path');
const { DefinePlugin } = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();

// read the constants from the constants file or return an empty object if not found
function getConstants() {
  let res = {};
  try {
    res = require('./constants');
  } finally {
    return res;
  }
}

module.exports = env => {
  const targetPath = join(__dirname, 'app');
  const isProduction = !env || !env.dev;
  const isPackage = (env && env.pack) || false;
  const defines = {
    ...getConstants(),
    NODE_ENV: isProduction ? 'production' : 'development',
    IS_PRODUCTION: isProduction,
    IS_PACKAGE: isPackage,
    GIT_VERSION: gitRevisionPlugin.version(),
    GIT_COMMITHASH: gitRevisionPlugin.commithash(),
    GIT_BRANCH: gitRevisionPlugin.branch(),
  };
  console.log(`Webpack building with ${JSON.stringify(defines, null, 2)}`);

  return {
    mode: isProduction ? 'production' : 'development',
    watch: !isProduction,
    devtool: isProduction ? undefined : 'source-map',

    entry: {
      index: join(__dirname, 'src', 'index.ts'),
    },
    output: {
      path: targetPath,
    },

    stats: {
      assetsSort: 'name',
      modules: false,
      children: false,
      excludeAssets: [/hot(-update)?\.js(on)?/, /webpack-dev-server/],
      warningsFilter: [
        /node-pty/,
        'event-stream/index.js',
        'colors/lib/colors.js',
      ],
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })],
      alias: {
        blessed$: 'neo-blessed',
      },
    },

    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
    },

    optimization: {
      minimize: isProduction,
      namedModules: !isProduction,
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
          test: join(
            __dirname,
            'node_modules',
            'neo-blessed',
            'lib',
            'tput.js'
          ),
          loader: 'string-replace-loader',
          options: {
            search: "__dirname \\+ '/../usr/",
            replace: isPackage
              ? "require('path').dirname(process.execPath) + '/usr/"
              : "__dirname + '/usr/",
            flags: 'g',
          },
        },
      ],
    },

    plugins: [
      new DefinePlugin(
        (() => {
          const c = { ...defines };
          Object.keys(c).forEach(k => {
            c[k] = JSON.stringify(c[k]);
          });
          return c;
        })()
      ),
      // Copy the files required by blessed in runtime into the target `app` folder:
      new CopyPlugin([
        {
          from: join(__dirname, 'node_modules', 'neo-blessed', 'usr'),
          to: 'usr',
        },
      ]),
    ]
      // when packing, we need to copy resources to the binary folder too
      .concat(
        isPackage
          ? [
              new CopyPlugin([
                {
                  from: join(__dirname, 'node_modules', 'neo-blessed', 'usr'),
                  to: 'bin/usr',
                },
                {
                  from: join(targetPath, 'data'),
                  to: 'bin/data',
                },
              ]),
            ]
          : []
      ),
  };
};
