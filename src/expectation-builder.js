/*global module, require */
module.exports = function (stepArgumentArray, extensionsArray) {
	'use strict';
	var self = this,
		Expect = require('./expect'),
		expectations = [],
		extensions = extensionsArray || [],
		findPosition = function (expectation) {
			if (expectation.position !== undefined) {
				if (expectation.position >= 0 && expectation.position < stepArgumentArray.length) {
					return expectation.position;
				}
				return;
			}
			var lastIndex = stepArgumentArray.lastIndexOf(expectation.expected);
			if (lastIndex >= 0) {
				return lastIndex;
			}
		};
	self.expect = function (actual) {
		var expect = new Expect(actual),
			extensionName;
		for (extensionName in extensionsArray) {
			if (extensions.hasOwnProperty(extensionName) && typeof extensions[extensionName] === 'function') {
				expect[extensionName] = extensions[extensionName].bind(expect);
			}
		}
		expectations.push(expect);
		return expect;
	};
	self.getAssertions = function () {
		var assertions = [];
		expectations.forEach(function (expectation) {
			var results = expectation.assertions;
			// console.log('results', results);
			results.forEach(function (result) {
				var position = findPosition(result);
				if (position !== undefined) {
					result.position = position;
				} else {
					delete result.position;
				}
			});
			assertions = assertions.concat(results);
		});
		return assertions;
	};
};
