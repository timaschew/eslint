# Hound ESLint

[ESLint] is the pluggable linting utility for JavaScript and JSX

`hound-eslint` is a Node service that polls `EslintReviewJob`s from the
`eslint_review` queue, lints code with `ESLint`, then pushes the results to
the `high` queue, as `CompletedFileReviewJob`s.

[ESLint]: http://eslint.org/

## Testing locally

First, add the following to the bottom of `index.js`:

```js
var testQueue = require("./lib/test-queue");

testQueue(redis);
```

Next, start the Resque web interface:

```bash
$ cd node_modules/node-resque/resque-web
$ bundle install
$ bundle exec rackup
$ open http://localhost:9292
```

As you run the worker, monitor how jobs flow through the queues.
