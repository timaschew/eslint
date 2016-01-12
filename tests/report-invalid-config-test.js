var ReportInvalidConfig = require("../lib/report-invalid-config");

QUnit.module("Reporting");

test("Reporting an invalid configuration file", function() {
  var reportInvalidConfigQueue = {
    enqueue: function(job) {
      return job;
    },
  };
  var payload = {
    content: "var foo",
    config: "{ \"rules\": { \"semi\": 2 } }",
    filename: "filename",
    commit_sha: "commit_sha",
    pull_request_number: "pull_request_number",
    patch: "patch",
  };
  var reportInvalidConfig = new ReportInvalidConfig(reportInvalidConfigQueue);

  var job = reportInvalidConfig.run(payload);

  equal(
    job.pull_request_number,
    payload.pull_request_number,
    "passes through pull_request_number"
  );
  equal(
    job.commit_sha,
    payload.commit_sha,
    "passes through commit_sha"
  );
  equal(
    job.linter_name,
    "eslint",
    "passes through linter_name"
  );
});
