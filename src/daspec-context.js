/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
		StepExecutor =  require('./daspec-step'),
		steps = [];

	self.defineStep = function (regexMatcher, processFunction) {
		/* TODO: bork if it has non capture groups */
		steps.push(new StepExecutor(regexMatcher, processFunction));
	};
	self.getStepForLine = function (stepText) {
		var matchingSteps = steps.filter(function (step) {
				return step.match(stepText);
			});

		if (matchingSteps.length === 0) {
			return false;
		} else if (matchingSteps.length > 1) {
			/* bork on multiple options possible */
			throw new Error('multiple steps match line ' + stepText);
		}
		return matchingSteps[0];
	};
};
