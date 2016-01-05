var EsLint = require("eslint").linter;
var configFile = require("eslint/lib/config/config-file");
var rules = require("eslint/lib/rules");
var util = require("eslint/lib/util");
var fs = require("fs");
var temp = require("temp").track();

var whitelist = [
  "react"
];

function Linter(outbound) {
  this.outbound = outbound;
}

Linter.prototype.parseConfig = function(config) {
  if (!config) {
    config = "{}";
  }

  var path = temp.path("eslintrc");
  fs.writeFileSync(path, config, "utf8", function() {});

  try {
    var configContent = configFile.load(path);
    this.loadPlugins(configContent.plugins);
    temp.cleanup();
    return configContent;
  } catch (exception) {
    console.log("Invalid ESLint configuration:");
    console.log(config);
    console.log(exception);

    return {};
  }
}

Linter.prototype.requirePlugin = function(pluginName) {
  var pluginNamespace = util.getNamespace(pluginName),
      pluginNameWithoutNamespace = util.removeNameSpace(pluginName),
      pluginNameWithoutPrefix = util.removePluginPrefix(
        pluginNameWithoutNamespace
      ),
      plugin;

  if (whitelist.indexOf(pluginNameWithoutPrefix) > -1) {
    plugin = require(
      pluginNamespace +
      util.PLUGIN_NAME_PREFIX +
      pluginNameWithoutPrefix
    );
    // if this plugin has rules, import them
    if (plugin.rules) {
      rules.import(plugin.rules, pluginNameWithoutPrefix);
    }
  }
}

// Stolen, and modified, from:
// https://github.com/eslint/eslint/blob/72a325ca31be20f7a9695556cb5883cd4e9cce14/lib/cli-engine.js#L110-L136
Linter.prototype.loadPlugins = function(pluginNames) {
  if (!pluginNames) { return };

  pluginNames.forEach(this.requirePlugin);
}

Linter.prototype.lint = function(payload) {
  var errors = EsLint.verify(
    payload.content,
    this.parseConfig(payload.config)
  );

  var violations = errors.map(function(error) {
    return { line: error.line, message: error.message };
  });

  return this.outbound.enqueue({
    violations: violations,
    filename: payload.filename,
    commit_sha: payload.commit_sha,
    pull_request_number: payload.pull_request_number,
    patch: payload.patch,
  });
};

module.exports = Linter;
