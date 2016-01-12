var EsLint = require("eslint").linter;
var Config = require("./config");
var ReportInvalidConfig = require("./report-invalid-config");

function Linter(resultQueues) {
  this.completedFileReviewQueue = resultQueues.complete;
  this.reportInvalidConfigQueue = resultQueues.invalid;
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

    return this.completedFileReviewQueue.enqueue({
      violations: violations,
      filename: payload.filename,
      commit_sha: payload.commit_sha,
      pull_request_number: payload.pull_request_number,
      patch: payload.patch,
    });
  } else {
    var reportInvalidConfig = new ReportInvalidConfig(
      this.reportInvalidConfigQueue
    );
    return reportInvalidConfig.run(payload);
  }
};

module.exports = Linter;
