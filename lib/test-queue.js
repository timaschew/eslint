var Queue = require("hound-javascript/lib/queue");

module.exports = function(redis) {
  var inbound = new Queue({
    redis: redis,
    queueName: "eslint_review",
    jobName: "EslintReviewJob",
  });

  inbound.enqueue({
    content: "var x = 5;;",
    config: "{ \"no-extra-semi\": true }",
  });
};
