const path = require('path');

module.exports = {
  entry: './index.jsx',
  mode: 'development',
  output: {
    filename: 'client-bundle.js',
    path: path.resolve(__dirname, '../out')
  },
  devServer: {
    contentBase: path.resolve(__dirname, '../out'),
    compress: true,
    port: 7041,
    watchContentBase: true,
    progress: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|browser_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      },
      {
        test: /\.(png|swg|jpg|gif)$/,
        use: [ 'file-loader' ]
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js']
  },
};