/*global module, require*/
module.exports = function StepContext(result) {
	'use strict';
	var self = this,
			ListUtil = require('./list-util'),
			Assertion = require('./assertion'),
			listUtil = new ListUtil();
	self.assertEquals = function (expected, actual, optionalOutputIndex) {
		var	passed = expected == actual;
		result.assertions.push(new Assertion(expected,
					actual,
					passed, optionalOutputIndex));
	};
	self.assertTableEquals = function (expected, actual) {
		var tableResult = {matches: false, value: actual};
		result.assertions.push(new Assertion(expected,
					tableResult,
					tableResult.matches));
	};
	self.assertSetEquals = function (expected, actual) {
		var listResult = listUtil.unorderedMatch(expected, actual);
		result.assertions.push(new Assertion(expected,
					listResult,
					listResult.matches));
	};
};
