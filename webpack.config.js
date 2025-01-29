const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: path.resolve(__dirname, 'src', 'popup', 'index.tsx'),
    content: path.resolve(__dirname, 'src', 'content', 'content.ts'),
    background: path.resolve(__dirname, 'src', 'background', 'background.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'), // Correct alias to `src/`
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    mainFields: ['browser', 'module', 'main'], // Ensures Webpack prioritizes browser-compatible modules
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]',
        },
      },
    ],
  },
  optimization: {
    usedExports: true,
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'popup', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src', 'manifest.json'), to: 'manifest.json', noErrorOnMissing: true },
        { from: path.resolve(__dirname, 'src', 'assets'), to: 'assets', noErrorOnMissing: true },
      ],
    }),
  ],
  mode: 'production',
  devtool: process.env.NODE_ENV === 'production' ? false : 'inline-source-map',
};
