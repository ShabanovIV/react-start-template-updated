import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (_, argv) => {
  const isProd = argv.mode === 'production';

  const styleOrExtract = isProd ? MiniCssExtractPlugin.loader : 'style-loader';

  return {
    entry: path.resolve(__dirname, 'src', 'index.tsx'),

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? '[name].[contenthash].js' : '[name].js',
      clean: true,
      publicPath: '/',
    },

    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json'],
      alias: {
        src: path.resolve(__dirname, 'src'),
      },
    },

    cache: { type: 'filesystem' },

    module: {
      rules: [
        // TypeScript Loader
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.build.json'),
            },
          },
          exclude: /node_modules|(\.test\.tsx?$|\.spec\.tsx?$|__tests__)/,
        },
        // SCSS Modules: *.module.scss
        {
          test: /\.module\.s[ac]ss$/i,
          use: [
            styleOrExtract,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]__[hash:base64:5]',
                  namedExport: false,
                  exportLocalsConvention: 'as-is',
                },
                importLoaders: 2,
                sourceMap: !isProd,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: !isProd,
                postcssOptions: {
                  config: false,
                  plugins: ['autoprefixer'],
                },
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: !isProd,
                sassOptions: {
                  includePaths: [path.resolve(__dirname, 'src', 'shared', 'styles')],
                },
              },
            },
          ],
        },
        // Global SCSS: *.scss (кроме *.module.scss)
        {
          test: /\.s[ac]ss$/i,
          exclude: /\.module\.s[ac]ss$/i,
          use: [
            styleOrExtract,
            {
              loader: 'css-loader',
              options: { importLoaders: 2, sourceMap: !isProd },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: !isProd,
                postcssOptions: {
                  config: false,
                  plugins: ['autoprefixer'],
                },
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: !isProd,
                sassOptions: {
                  includePaths: [path.resolve(__dirname, 'src', 'shared', 'styles')],
                },
              },
            },
          ],
        },
        // SVG as React component + URL (?url)
        {
          test: /\.svg$/i,
          oneOf: [
            // import iconUrl from "./icon.svg?url"
            {
              resourceQuery: /url/,
              type: 'asset/resource',
              generator: {
                filename: 'assets/[name].[contenthash][ext]',
              },
            },
            // import { ReactComponent as Icon } from "./icon.svg"
            {
              issuer: /\.[jt]sx?$/,
              use: [
                {
                  loader: '@svgr/webpack',
                  options: {
                    svgo: true,
                    titleProp: true,
                    svgoConfig: {
                      plugins: [
                        {
                          name: 'preset-default',
                          params: { overrides: { removeViewBox: false } },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
        // Images / assets
        {
          test: /\.(png|jpe?g|gif|webp|avif|ico)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[contenthash][ext]',
          },
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public', 'index.html'),
      }),
      ...(isProd ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })] : []),
    ],

    devServer: {
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
      static: {
        directory: path.resolve(__dirname, 'public'),
      },
    },

    performance: isProd
      ? {
          maxAssetSize: 800000,
          maxEntrypointSize: 1024000,
        }
      : false,

    optimization: isProd
      ? {
          splitChunks: { chunks: 'all' },
          runtimeChunk: 'single',
        }
      : undefined,
  };
};
