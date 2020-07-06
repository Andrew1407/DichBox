const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    chunkFilename: '[id].js',
    publicPath: ''
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          { 
            loader: 'css-loader',
            options: {
                modules: {
                  localIdentName: "[name]__[local]___[hash:base64:5]",
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
        loader: 'url-loader?limit=10000&name=img/[name].[ext]'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/src/index.html',
      filename: 'index.html',
      inject: 'body'
    })
  ],
  devServer: {
    port: 7042,
    host: '192.168.0.223'
  }
}