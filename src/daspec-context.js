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
		RegexUtil = require('./regex-util'),
		StepExecutor =  require('./daspec-step'),
		regexUtil = new RegexUtil(),
		// Assertion = require('./assertion'),
		AssertionCounts = require('./assertion-counts'),
		MarkDownFormatter = require('./markdown-formatter'),
		// ListUtil = require('./list-util'),
		// listUtil = new ListUtil(),
		markDownFormatter = new MarkDownFormatter(),
		steps = [],
		getStepForText = function (stepText) {
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
	self.defineStep = function (regexMatcher, processFunction) {
		steps.push(new StepExecutor(regexMatcher, processFunction));
	};
	self.executeBlock = function (block) {
		var counts = new AssertionCounts(),
			resultBuffer = [],
			blockLines = block.getMatchText(),
			blockList = block.getList();
		if (blockLines) {
			blockLines.forEach(function (line) {
				self.executeStep(line, blockList, counts, resultBuffer);
			});
		}
		return {
			resultBuffer: resultBuffer,
			counts: counts
		};
	};
	self.executeStep = function (stepText, list, counts, resultBuffer) {
		if (!regexUtil.assertionLine(stepText)) { //Move to block?
			resultBuffer.push(stepText);
			return;
		}

		var step = getStepForText(stepText),
			result;

		if (!step) {
			resultBuffer.push(stepText); //+ list
			counts.skipped++;
			return;
		}
		result = step.execute(stepText, list);
		if (result.exception) {
			/* geniuine error, not assertion fail */
			resultBuffer.push('~~' + stepText + '~~'); //TODO: push list as well
			resultBuffer.push('\t' + result.exception.stack);
			counts.recordException(result.exception);
		} else {
			result.assertions.forEach(function (assertion) {
				counts.increment(assertion);
			});
			resultBuffer.push(markDownFormatter.markResult(result.assertions, stepText, result, list));
		}
	};
};
