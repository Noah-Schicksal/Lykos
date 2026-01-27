const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const createPage = (name) => new HtmlWebpackPlugin({
  filename: `${name}.html`,
  template: `./src/templates/${name}.html`,
  chunks: [name],
  minify: { collapseWhitespace: true, removeComments: true },
});

module.exports = {
  mode: 'development',
  entry: {
    login: './src/pages/login/index.ts',
    cursos: './src/pages/cursos/index.ts',
    instrutor: './src/pages/instrutor/index.ts',
    notFound: './src/shared/styles/global.css',
  },
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, '../public'),
    clean: true,
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
      { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset/resource', generator: { filename: 'images/[name][ext]' } },
    ],
  },
  resolve: { extensions: ['.ts', '.js'] },
  optimization: { splitChunks: { chunks: 'all' } },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' }),
    createPage('login'),
    createPage('cursos'),
    createPage('instrutor'),
    new HtmlWebpackPlugin({ filename: '404.html', template: './src/templates/404.html', chunks: ['notFound'] }),
    new CopyPlugin({ patterns: [{ from: "public", to: "" }] }),
  ],
  devServer: {
    static: './dist',
    hot: true,
    port: 3000,
    historyApiFallback: { rewrites: [{ from: /^\/$/, to: '/login.html' }] },
  },
};