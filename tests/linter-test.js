var Redis = require("fakeredis");
var HoundJavascript = require("hound-javascript");
var lastJob = require("./helpers/redis").lastJob;

var Linter = require("../lib/linter");

QUnit.module("Linter");

asyncTest("ESLint linting", function() {
  var payload = {
    content: "var foo",
    config: "{ \"rules\": { \"semi\": 2 } }",
    filename: "filename",
    commit_sha: "commit_sha",
    pull_request_number: "pull_request_number",
    patch: "patch",
  };
  var redis = Redis.createClient();
  var houndJavascript = new HoundJavascript(redis);
  var linter = new Linter(houndJavascript);

  linter.lint(payload).then(function() {
    lastJob(redis, "high", function(job) {
      start();

      equal(
        job.class,
        "CompletedFileReviewJob",
        "pushes the proper job type"
      );
      deepEqual(
        job.args[0],
        {
          violations: [ { line: 1, message: 'Missing semicolon.' } ],
          filename: 'filename',
          commit_sha: 'commit_sha',
          pull_request_number: 'pull_request_number',
          patch: 'patch',
        },
        "pushes a job onto the queue"
      );
    });
  });
});

asyncTest("Reporting invalid configuration file", function() {
  var payload = {
    content: "var foo",
    config: "---\nyaml: is good\ntrue/false/syntax/error",
    filename: "filename",
    commit_sha: "commit_sha",
    pull_request_number: "pull_request_number",
    patch: "patch",
  };
  var redis = Redis.createClient();
  var houndJavascript = new HoundJavascript(redis);
  var linter = new Linter(houndJavascript);

  var job = linter.lint(payload);

  linter.lint(payload).then(function() {
    lastJob(redis, "high", function(job) {
      start();

      equal(
        job.class,
        "ReportInvalidConfigJob",
        "pushes the proper job type"
      );
      deepEqual(
        job.args[0],
        {
          pull_request_number: "pull_request_number",
          commit_sha: "commit_sha",
          linter_name: "eslint",
        },
        "pushes a job onto the queue"
      );
    });
  });
});
