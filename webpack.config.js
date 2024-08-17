const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = (env) => {
  const isFirefox = env.BROWSER === 'firefox';
  const browserName = isFirefox ? 'firefox' : 'chrome';

  const config = {
    entry: {
      background: './src/background.ts',
      content: './src/content.ts',
      popup: './src/popup.ts',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { 
            from: './public', 
            to: './',
            globOptions: {
              ignore: ['**/manifest*.json'],
            },
          },
          { 
            from: isFirefox ? './public/manifest-firefox.json' : './public/manifest.json',
            to: './manifest.json'
          },
        ],
      }),
    ],
  };

  const devConfig = {
    ...config,
    mode: 'development',
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, `dist-${browserName}`),
    },
    devtool: 'inline-source-map',
  };

  const prodConfig = {
    ...config,
    mode: 'production',
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, `temp-${browserName}-prod`),
    },
    plugins: [
      ...config.plugins,
      new ZipPlugin({
        path: path.resolve(__dirname, 'zips'),
        filename: `${browserName}-extension.zip`,
        extension: 'zip',
        fileOptions: {
          mtime: new Date(),
          mode: 0o100664,
          compress: true,
          forceZip64Format: false,
        },
        zipOptions: {
          forceZip64Format: false,
        },
      }),
    ],
  };

  return [devConfig, prodConfig];
};