function ReportInvalidConfig(queue) {
  this.queue = queue;
};

ReportInvalidConfig.prototype.run = function(payload) {
  return this.queue.enqueue({
    pull_request_number: payload.pull_request_number,
    commit_sha: payload.commit_sha,
    linter_name: "eslint",
  });
};

module.exports = ReportInvalidConfig;
