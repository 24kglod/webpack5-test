import * as path from "path";
import { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import portfinder from "portfinder";

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

const cssExtract = isProduction ? MiniCssExtractPlugin.loader : "style-loader";
const cssModules = {
  localIdentName: isDevelopment ? "[path][name]__[local]" : "[hash:base64]",
  auto: /(?<!\.global)\.\w+$/i,
  exportLocalsConvention: "camelCaseOnly",
};
const postcssLoader = {
  loader: "postcss-loader",
  options: {
    postcssOptions: {
      plugins: ["autoprefixer", "cssnano"],
    },
  },
};

const styleHandle = isProduction ? { loader: cssExtract } : "style-loader";

const config: Configuration = {
  devtool: isDevelopment ? "eval-cheap-module-source-map" : false,
  entry: path.resolve(__dirname, "src/index.tsx"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "build/[name].[contenthash].js",
    chunkFilename: "build/[name].[contenthash].js",
    assetModuleFilename: "assets/[hash][ext][query]",
    clean: true,
  },
  devServer: {
    client: {
      overlay: false,
    },
    static: {
      directory: path.join(__dirname, "dist"),
    },
    historyApiFallback: true,
    compress: true,
    open: false,
    hot: true,
    port: 8000,
  },
  optimization: {
    runtimeChunk: "single",
    moduleIds: "deterministic",
    splitChunks: {
      chunks: "all",
    },
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", "..."],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  stats: "minimal",
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                babelrc: false,
                presets: [
                  [
                    // https://github.com/babel/babel/issues/9853#issuecomment-619587386
                    "@babel/preset-env",
                    {
                      useBuiltIns: "entry",
                      corejs: 3.19,
                    },
                  ],
                  ["@babel/preset-react", { runtime: "automatic" }],
                  "@babel/preset-typescript",
                ],
                plugins: [
                  "@babel/plugin-transform-runtime",
                  isDevelopment && "react-refresh/babel",
                ].filter(Boolean),
              },
            },
          },
          {
            test: /\.css$/i,
            exclude: /node_modules/,
            use: [
              styleHandle,
              {
                loader: "css-loader",
                options: {
                  importLoaders: 1,
                  modules: cssModules,
                },
              },
              postcssLoader,
            ],
          },
          {
            test: /\.less$/i,
            exclude: /node_modules/,
            use: [
              styleHandle,
              {
                loader: "css-loader",
                options: {
                  importLoaders: 2,
                  modules: cssModules,
                },
              },
              postcssLoader,
              {
                loader: "less-loader",
                options: {
                  lessOptions: {
                    // https://github.com/ant-design/ant-motion/issues/44
                    javascriptEnabled: true,
                  },
                },
              },
            ],
          },
          {
            test: /\.s[ac]ss$/i,
            exclude: /node_modules/,
            use: [
              styleHandle,
              {
                loader: "css-loader",
                options: {
                  importLoaders: 2,
                  modules: cssModules,
                },
              },
              postcssLoader,
              { loader: "sass-loader" },
            ],
          },
          {
            test: /\.css$/i,
            include: /node_modules/,
            use: [styleHandle, "css-loader"],
          },
          {
            test: /\.less$/i,
            include: /node_modules/,
            use: [
              styleHandle,
              {
                loader: "css-loader",
                options: { importLoaders: 1 },
              },
              {
                loader: "less-loader",
                options: {
                  lessOptions: {
                    javascriptEnabled: true,
                  },
                },
              },
            ],
          },
          {
            test: /\.s[ac]ss$/i,
            include: /node_modules/,
            use: [
              styleHandle,
              {
                loader: "css-loader",
                options: { importLoaders: 1 },
              },
              { loader: "sass-loader" },
            ],
          },
          {
            test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|tf|otf)$/i,
            type: "asset",
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.ejs"),
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
};

export default new Promise((resolve, reject) => {
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err);
    } else {
      config.devServer.port = port;
      resolve(config);
    }
  });
});
