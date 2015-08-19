/*global module, global*/
module.exports = function Context() {
	'use strict';
	var self = this,
		steps = [],
		expectationMatchers = [],
		stepMatch = function (stepDefinition, stepText) {
			if (stepText instanceof RegExp) {
				return stepDefinition.matcher.source === stepText.source;
			}
			if (!stepText) {
				return false;
			}
			return !!stepText.match(stepDefinition.matcher);
		},
		matchingSteps = function (stepText) {
			return steps.filter(function (stepDefinition) {
				return stepMatch(stepDefinition, stepText);
			});
		},
		globalOverrides = {},
		exportedOverrides = {},
		overrideGlobal = function (map, propname, value) {
			if (!map[propname]) {
				map[propname] = global[propname];
			}
			global[propname] = value;
		},
		resetGlobal = function (map) {
			var propname;
			for (propname in map) {
				global[propname] = map[propname];
				delete map[propname];
			}
		};
	self.exportToGlobal = function () {
		overrideGlobal(exportedOverrides, 'defineStep',  self.defineStep);
		overrideGlobal(exportedOverrides, 'addMatchers',  self.addMatchers);
	};
	self.unexportFromGlobal = function () {
		resetGlobal(exportedOverrides);
	};
	self.addMatchers = function (matcherObject) {
		expectationMatchers.push(matcherObject);
	};
	self.getMatchers = function () {
		return expectationMatchers;
	};
	self.overrideGlobal = function (propname, value) {
		overrideGlobal(globalOverrides, propname, value);
	};
	self.resetGlobal = function () {
		resetGlobal(globalOverrides);
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
