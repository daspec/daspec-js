/*global module, require */
module.exports = function Expect(actualValue, matchersArray) {
	'use strict';
	var self = this,
		negated = false,
		assertions = [],
		addMatchers = function (matchers) {
			var matcherName;
			for (matcherName in matchers) {
				if (matchers.hasOwnProperty(matcherName) && typeof matchers[matcherName] === 'function') {
					self[matcherName] = matchers[matcherName].bind(self);
				}
			}
		},
		deepEqual = require('deep-equal');
	if (Array.isArray(matchersArray)) {
		matchersArray.forEach(addMatchers);
	} else if (matchersArray) {
		addMatchers(matchersArray);
	}
	self.pushAssertions = function (pushedAssertions) {
		if (pushedAssertions && pushedAssertions.length) {
			assertions = assertions.concat(pushedAssertions);
		}
	};
	self.addAssertion = function (didPass, expected, detail) {
			var calcPassed = function (didPass) {
					if (negated) {
						return !didPass;
					}
					return didPass;
				},
				assertion = {actual: self.actual, passed: calcPassed(didPass)};
			if (detail) {
				assertion.detail = detail;
			}
			if (expected) {
				assertion.expected = expected;
			}
			assertions.push(assertion);
			return assertion;
		};
	self.actual = actualValue;
	Object.defineProperty(self, 'not', {get: function () {
		negated = !negated;
		return self;
	}});
	Object.defineProperty(self, 'assertions', {get: function () {
		return assertions.slice(0);
	}});
	Object.defineProperty(self, 'lastAssertion', {get: function () {
		if (assertions.length === 0) {
			return;
		}
		return assertions[assertions.length - 1];
	}});
	self.atPosition = function (position) {
		var last = self.lastAssertion;
		if (last) {
			last.position = position;
		}
		return self;
	};
	self.toEqual = function (expected) {
		self.addAssertion(deepEqual(self.actual, expected), expected);
		return self;
	};

	self.toBeTruthy = function () {
		self.addAssertion(!!self.actual);
		return self;
	};
	self.toBeFalsy = function () {
		self.addAssertion(!self.actual);
		return self;
	};
	self.toBeTrue = function () {
		self.addAssertion(self.actual === true);
		return self;
	};
	self.toBeFalse = function () {
		self.addAssertion(self.actual === false);
		return self;
	};


	self.toBeGreaterThan = function (expected) {
		self.addAssertion(self.actual > expected, expected);
		return self;
	};
	self.toBeLessThan = function (expected) {
		self.expected = expected;
		self.addAssertion(self.actual < expected, expected);
		return self;
	};
	self.toBeGreaterThanOrEqual = function (expected) {
		self.addAssertion(self.actual >= expected, expected);
		return self;
	};
	self.toBeLessThanOrEqual = function (expected) {
		self.addAssertion(self.actual <= expected, expected);
		return self;
	};
	self.toBeBetween = function (range1, range2) {
		self.toBeGreaterThanOrEqual(Math.min(range1, range2)).toBeLessThanOrEqual(Math.max(range1, range2));
		return self;
	};
	self.toBeWithin = function (range1, range2) {
		self.toBeGreaterThan(Math.min(range1, range2)).toBeLessThan(Math.max(range1, range2));
		return self;
	};

};
