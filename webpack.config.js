const webpack = require('webpack'),
  HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode: 'production',
    entry:  './js/index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'index.js'
    },
    devServer: {
        inline: true,
        port: 8099
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename:"index.html",
        template:"./index.html",
        chunks:["index","vendor"],
        minify:{
          removeComment:true,
          collapseWhitespace:true
        }
      }),
      new webpack.HotModuleReplacementPlugin()
    ]
}