/*global module, require*/

/*
move formating out of context


- responsibilities

	-> provide md source file/s
		-> web loader
		-> file loader
		-> text area loader
	-> convert between page md and blocks (parsing)						[ExampleBlocks]
	-> convert between blocks and "steps"
		-> allow users to define matchers for steps						[Context]
		-> convert between blocks and "steps" (execution)				[Context]

	-> execution/runner
		-> control the flow on a single page (setup/steps/teardown/beforeeach/aftereach) [Runner]
		-> control the flow on a whole suite (suite setup/pages/suite teardown/beforeall/afterall) [Runner]
		-> execute "steps"												[Runner]
		-> carry "step" execution info in a format-agnostic way			[Step]
	-> format results													[Formatter]
		-> format results as md
		-> format results as counts (junit xml or tap)


*/
module.exports = function () {
	'use strict';
	var self = this,
		StepExecutor =  require('./daspec-step'),
		steps = [];

	self.defineStep = function (regexMatcher, processFunction) {
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
