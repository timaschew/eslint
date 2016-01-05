var EsLint = require("eslint").linter;
var configFile = require("eslint/lib/config/config-file");
var fs = require("fs");
var temp = require("temp").track();

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
    temp.cleanup();
    return configContent;
  } catch (exception) {
    console.log("Invalid ESLint configuration:");
    console.log(config);
    console.log(exception);

    return {};
  }
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
