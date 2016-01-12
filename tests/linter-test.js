var Linter = require("../lib/linter");
var Config = require("../lib/config");

QUnit.module("Linter");

test("ESLint linting", function() {
  var payload = {
    content: "var foo",
    config: "{ \"rules\": { \"semi\": 2 } }",
    filename: "filename",
    commit_sha: "commit_sha",
    pull_request_number: "pull_request_number",
    patch: "patch",
  };
  var linter = buildLinter();

  var job = linter.lint(payload);
  var violation = job.violations[0];

  ok(violation.message.match(/semicolon/i), "includes the proper message");
  equal(violation.line, 1, "includes the proper line");
  equal(job.filename, payload.filename, "passes through filename");
  equal(job.commit_sha, payload.commit_sha, "passes through commit_sha");
  equal(
    job.pull_request_number,
    payload.pull_request_number,
    "passes through pull_request_number"
  );
  equal(job.patch, payload.patch, "passes through patch");
});

test("Reporting invalid configuration file", function() {
  var payload = {
    content: "var foo",
    config: "---\nyaml: is good\ntrue/false/syntax/error",
    filename: "filename",
    commit_sha: "commit_sha",
    pull_request_number: "pull_request_number",
    patch: "patch",
  };
  var linter = buildLinter();

  var job = linter.lint(payload);

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

buildLinter = function() {
  var completedFileReviewQueue = {
    enqueue: function(job) {
      return job;
    },
  };
  var reportInvalidConfigQueue = {
    enqueue: function(job) {
      return job;
    },
  };
  var linter = new Linter({
    complete: completedFileReviewQueue,
    invalid: reportInvalidConfigQueue,
  });

  return linter;
};
