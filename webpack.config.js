const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

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
      '@': path.resolve(__dirname, 'src'),
    },
    mainFields: ['module', 'main', 'browser'],
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "url": require.resolve("url/"),
      "zlib": require.resolve("browserify-zlib"),
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),
      "buffer": require.resolve("buffer/")
    }
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
    usedExports: true, // 🔥 Tree shaking: Removes unused exports
    minimize: true, // 🔥 Minify JS output
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true, // Removes console logs for production
          },
          output: {
            comments: false, // Removes comments
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all', // 🔥 Code Splitting: Extracts common dependencies
    },
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@supabase/supabase-js': 'Supabase',
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
    new CompressionPlugin(), // 🔥 Enables Gzip compression
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
    }),
  ],
  mode: 'production',
  devtool: false,
};
