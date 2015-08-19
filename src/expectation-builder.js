/*global module, require */
module.exports = function ExpectationBuilder(stepArgumentArray, matchersArray) {
	'use strict';
	var self = this,
		Expect = require('./expect'),
		expectations = [],
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
			addMatcher = function (matchers) {
				var matcherName;
				for (matcherName in matchers) {
					if (matchers.hasOwnProperty(matcherName) && typeof matchers[matcherName] === 'function') {
						expect[matcherName] = matchers[matcherName].bind(expect);
					}
				}
			};
		if (Array.isArray(matchersArray)) {
			matchersArray.forEach(addMatcher);
		} else if (matchersArray) {
			addMatcher(matchersArray);
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
