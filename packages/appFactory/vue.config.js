const path = require("path");
const configureWebpack = require("./utils/configureWebpack");
const devServer = require("./utils/devServer");
const build = require("./build.json");

module.exports = {
  runtimeCompiler: true,
  publicPath: build.publicPath,
  productionSourceMap: process.env.NODE_ENV !== "production",
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "less",
      patterns: [path.resolve(__dirname, "./src/assets/less/common.less")],
    },
  },
  devServer,
  configureWebpack,
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = build.title;
      return args;
    });
  },
};
