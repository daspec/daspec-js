#!/usr/bin/env node

var Jasmine = require('jasmine');
var SpecReporter = require('jasmine-spec-reporter');
var noop = function() {};

var jrunner = new Jasmine();
if (process.argv[2] === 'full') {
	jrunner.configureDefaultReporter({print: noop});    // remove default reporter logs
	jasmine.getEnv().addReporter(new SpecReporter());   // add jasmine-spec-reporter
}
jrunner.loadConfigFile();                           // load jasmine.json configuration
jrunner.execute();
