const path = require("path"),
      CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  entry: "./modules/client/bundle.js",
  plugins: [
    new CleanWebpackPlugin(["dist"])
  ],
  output: {
    filename: "dino.js",
    path: path.resolve(__dirname, "public/js")
  }
};
