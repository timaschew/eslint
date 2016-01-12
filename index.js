var Redis = require("redis");
var Resque = require("node-resque");
var Config = require("./lib/config");
var Linter = require("./lib/linter");
var Queue = require("./lib/queue");

var redis = Redis.createClient(
  process.env.REDIS_URL || "redis://localhost:6379"
);

var completedFileReviewQueue = new Queue({
  redis: redis,
  queueName: "high",
  jobName: "CompletedFileReviewJob",
});
var reportInvalidConfigQueue = new Queue({
  redis: redis,
  queueName: "high",
  jobName: "ReportInvalidConfigJob",
});

var linter = new Linter({
  complete: completedFileReviewQueue,
  invalid: reportInvalidConfigQueue
});

var worker = new Resque.multiWorker({
  connection: { redis: redis },
  queues: ["eslint_review"],
}, {
  "EslintReviewJob": function(payload, callback) {
    linter.lint(payload).finally(callback);
  }
});

worker.start();

process.on("SIGINT", function() {
  worker.end(function() {
    process.exit();
  });
});
