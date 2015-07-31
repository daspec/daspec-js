/*global module, require*/
module.exports = function Context() {
	'use strict';
	var self = this,
		StepExecutor =  require('./daspec-step'),
		steps = [],
		matchingSteps = function (stepText) {
			return steps.filter(function (step) {
				return step.match(stepText);
			});
		};
	self.defineStep = function (regexMatcher, processFunction) {
		var matching = matchingSteps(regexMatcher);
		if (matching.length > 0) {
			throw new Error('the matching step is already defined');
		}
		steps.push(new StepExecutor(regexMatcher, processFunction));
	};
	self.getStepForLine = function (stepText) {
		var matching = matchingSteps(stepText);
		if (matching.length === 0) {
			return false;
		} else if (matching.length > 1) {
			throw new Error('multiple steps match line ' + stepText);
		}
		return matching[0];
	};
};
