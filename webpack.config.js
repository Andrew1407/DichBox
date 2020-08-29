const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
require('dotenv').config();


module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    chunkFilename: '[id].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
              '@babel/preset-env',
              '@babel/preset-react'
          ],
          plugins: [
              '@babel/transform-runtime'
          ]
        } 
      },
      {
        test: /\.css$/,
        // exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          { 
            loader: 'css-loader',
            options: {
                modules: {
                  localIdentName: "[local]"
                  // localIdentName: "[name]__[local]___[hash:base64:5]",
                },														
                sourceMap: true 
            }
          },
          { 
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                autoprefixer({})
              ]
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        loader: 'url-loader?limit=1000000&name=img/[name].[ext]'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|otf)$/,
        loader: 'file-loader',
        options: {
          name: './fonts/[name].[ext]',
        },
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/src/index.html',
      filename: 'index.html',
      inject: 'body'
    }),
    new Dotenv()
  ],
  devServer: {
    port: process.env.DEV_SERVER_PORT || 7042,
    host: process.env.DEV_SERVER_HOST || 'localhost',
    historyApiFallback: true,
  }
}