var Queue = require("./lib/queue");

module.exports = function(redis) {
  var inbound = new Queue({
    redis: redis,
    queueName: "eslint_review",
    jobName: "EsLintReviewJob",
  });

  inbound.enqueue({
    content: "var x = 5;;",
    config: "{ \"no-extra-semi\": true }",
  });
};
