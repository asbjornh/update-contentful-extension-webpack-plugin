const util = require("util");
const cp = require("child_process");

const exec = util.promisify(cp.exec);

const name = "UpdateContentfulExtensionPlugin";

function UpdateContentfulExtensionPlugin(options = {}) {
  this.isServing = false;
  this.options = options;
}

UpdateContentfulExtensionPlugin.prototype.apply = function (compiler) {
  compiler.hooks.afterEmit.tap({ name }, compilation =>
    runThePlugin.apply(this, [compiler, compilation])
  );
};

function runThePlugin(compiler, compilation) {
  const err = msg => compilation.errors.push(new Error(`${name}: ${msg}`));
  const logger = compiler.getInfrastructureLogger(name);

  if (compilation.errors.length) return;

  const runCommand = cmd =>
    exec(cmd)
      .then(({ stdout }) => console.log(stdout))
      .catch(error => {
        logger.error(error.message);
        process.exit(1);
      });

  const isDevServer = process.env.WEBPACK_DEV_SERVER;
  const {
    dev = isDevServer,
    descriptor,
    fileName = "index.html",
    https = false,
  } = this.options;

  const devServerPort =
    compiler.options.devServer && compiler.options.devServer.port;
  const port = this.options.port || devServerPort;

  if (!descriptor) return err("Mising 'descriptor' option.");

  if (dev) {
    if (this.isServing) return;
    if (!port) return err("Missing 'port' option.");
    this.isServing = true;

    const url = `${https ? "https" : "http"}://localhost:${port}`;
    const cmd = `npx contentful extension update --src ${url} --descriptor ${descriptor} --force`;
    runCommand(cmd);
  } else {
    const outFile = compilation.assets[fileName];
    if (!outFile) return err(`No output file named '${fileName}'`);

    const cmd = `npx contentful extension update --srcdoc ${outFile.existsAt} --descriptor ${descriptor} --force`;
    runCommand(cmd);
  }
}

UpdateContentfulExtensionPlugin["default"] = UpdateContentfulExtensionPlugin;

module.exports = UpdateContentfulExtensionPlugin;
