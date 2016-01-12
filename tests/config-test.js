var Config = require("../lib/config");

QUnit.module("Config");

test("Parsing an ESLint config file", function() {
  var config = new Config("{ \"rules\": { \"semi\": 2, }, }");

  deepEqual(
    config.parse(),
    {
      globals: {},
      env: {},
      rules: { semi: 2 },
      ecmaFeatures: {},
    }
  );
});

test("Determining a valid configuration file", function() {
  var config = new Config("{ \"rules\": { \"semi\": 2, }, }");

  equal(
    config.isValid(),
    true
  );
});

test("Determining an invalid configuration file", function() {
  var config = new Config("---\nyaml: is good\ntrue/false/syntax/error");

  equal(
    config.isValid(),
    false
  );
});
