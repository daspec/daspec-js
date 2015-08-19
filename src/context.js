/*global module, global*/
module.exports = function Context(globalObject) {
	'use strict';
	var self = this,
		steps = [],
		expectationMatchers = [],
		stepMatch = function (stepDefinition, stepText) {
			if (stepText instanceof RegExp) {
				return stepDefinition.matcher.source === stepText.source;
			}
			return stepDefinition.matcher.test(stepText); // TODO: make sure re-entrant
		},
		matchingSteps = function (stepText) {
			return steps.filter(function (stepDefinition) {
				return stepMatch(stepDefinition, stepText);
			});
		},
		globalOverrides = {};
	globalObject = globalObject || global;
	self.addMatchers = function (matcherObject) {
		expectationMatchers.push(matcherObject);
	};
	self.getMatchers = function () {
		return expectationMatchers;
	};
	self.overrideGlobal = function (propname, value) {
		if (!globalOverrides[propname]) {
			globalOverrides[propname] = globalObject[propname];
		}
		globalObject[propname] = value;
		//TODO write tests
	};
	self.resetGlobal = function () {
		var propname;
		for (propname in globalOverrides) {
			globalObject[propname] = globalOverrides[propname];
		}
		globalOverrides = {};
	};
	self.defineStep = function (regexMatcher, processFunction) {
		if (!regexMatcher) {
			throw new Error('Empty matchers are not supported');
		}
		if (regexMatcher.source.indexOf('(?:') >= 0) {
			throw new Error('Non-capturing regex groups are not supported');
		}
		var matching = matchingSteps(regexMatcher);
		if (matching.length > 0) {
			throw new Error('The matching step is already defined');
		}
		steps.push({matcher: regexMatcher, processFunction: processFunction});
	};
	self.getStepDefinitionForLine = function (stepText) {
		var matching = matchingSteps(stepText);
		if (matching.length === 0) {
			return false;
		} else if (matching.length > 1) {
			throw new Error('multiple steps match line ' + stepText);
		}
		return matching[0];
	};
};
