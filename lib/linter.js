var EsLint = require("eslint").linter;
var Config = require("./config");

function Linter(houndJavascript) {
  this.houndJavascript = houndJavascript;
}

Linter.prototype.lint = function(payload) {
  var config = new Config(payload.config);

  if (config.isValid()) {
    var errors = EsLint.verify(
      payload.content,
      config.parse()
    );

    var violations = errors.map(function(error) {
      return { line: error.line, message: error.message };
    });

    return this.houndJavascript.completeFileReview({
      violations: violations,
      filename: payload.filename,
      commit_sha: payload.commit_sha,
      pull_request_number: payload.pull_request_number,
      patch: payload.patch,
    });
  } else {
    return this.houndJavascript.reportInvalidConfig({
      pull_request_number: payload.pull_request_number,
      commit_sha: payload.commit_sha,
      linter_name: "eslint",
    });
  }
};

module.exports = Linter;
