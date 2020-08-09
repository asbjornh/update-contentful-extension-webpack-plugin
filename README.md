# Update Contentful extension Webpack plugin

This plugin will upload or serve a locally running extension to Contentful. This is useful if you like `contentful-extension-scripts` but want to build your extension(s) using Webpack instead. It also makes it easier for extensions to share code (currently not possible using `contentful-extension-scripts`).

The easiest way to get set up is to create a new extension using [create-contentful-extension](https://github.com/contentful/create-contentful-extension). After creating the extension, create your `webpack.config.js` and add and configure this plugin (see below).

## Installation

```
npm install --save-dev update-contentful-extension-webpack-plugin
```

## Example config

The below config assumes that `webpack-dev-server` is used for serving a local extension. When running the `dev` script, the extension will be served from `localhost` and can be viewed at `app.contentful.com`. When running the `deploy` script, the extension is uploaded to `app.contentful.com`.

<details>
<summary>View config</summary>

_package.json_

```json
{
  "scripts": {
    "dev": "webpack-dev-server --mode=development",
    "deploy": "webpack --mode=production"
  }
}
```

_webpack.config.js_

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineSourcePlugin = require("inline-source-webpack-plugin");
const MiniCssExtracPlugin = require("mini-css-extract-plugin");
const UpdateContentfulExtensionPlugin = require("update-contentful-extension-webpack-plugin");

module.exports = {
  devServer: { port: 1234 },
  entry: "./src/index.js",
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: [/node_modules/], use: "babel-loader" },
      { test: /\.css$/, use: [MiniCssExtracPlugin.loader, "css-loader"] },
    ],
  },
  plugins: [
    new MiniCssExtracPlugin(),
    new HtmlWebpackPlugin({
      // NOTE: For production all assets need to be inlined. For development we don't want assets inlined since then they would be cached. See the docs for `inline-source-webpack-plugin`
      template: process.env.WEBPACK_DEV_SERVER
        ? "./src/index-dev.html"
        : "./src/index.html",
    }),
    new InlineSourcePlugin(),
    new UpdateContentfulExtensionPlugin({
      descriptor: path.join(__dirname, "extension.json"),
    }),
  ],
};
```

_index-dev.html_

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

_index.html_

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link inline inline-asset="main.css" inline-asset-delete />
  </head>
  <body>
    <div id="root"></div>
    <script inline inline-asset="main.js" inline-asset-delete></script>
  </body>
</html>
```

</details>

## Configuration API

**dev**: `boolean` = `process.env.WEBPACK_DEV_SERVER`

Whether to serve the extension from `localhost` or to upload ut. Defaults to the value of the `WEBPACK_DEV_SERVER` environment variable set by `webpack-dev-server`.

---

**descriptor**: `string`

Required. An absolute path to `extension.json`.

---

**fileName**: `string` = `"index.html"`

The name of the output file. Only required if your output file name is different from `index.html`.

---

**https**: `boolean` = `false`

If set to `true`, will tell Contentful to load the local extension from `https://localhost`

---

**port**: `number` = `webpackOptions.devServer.port`

What port the local extension is available at. Defaults to the port used by `webpack-dev-server` if configured.

It seems like the `devServer` webpack option is required for the config object to contain the default port, but an empty object is enough (`devServer: {}`).
