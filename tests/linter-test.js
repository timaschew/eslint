var Linter = require("../lib/linter");

QUnit.module("Linter");

test("Parsing an ESLint config file", function() {
  var config = "{ \"rules\": { \"semi\": 2, }, }";
  var outbound = {
    enqueue: function(job) {
      return job;
    }
  };
  var linter = new Linter(outbound);

  deepEqual(
      linter.parseConfig(config),
      {
        globals: {},
        env: {},
        rules: { semi: 2 },
        ecmaFeatures: {}
      }
  );
});

test("ESLint linting", function() {
  var payload = {
    content: "var foo",
    config: "{ \"rules\": { \"semi\": 2 } }",
    filename: "filename",
    commit_sha: "commit_sha",
    pull_request_number: "pull_request_number",
    patch: "patch",
  };
  var outbound = {
    enqueue: function(job) {
      return job;
    }
  };
  var linter = new Linter(outbound);

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
