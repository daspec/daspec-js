/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		Assertion = require('./assertion'),
		AssertionCounts = require('./assertion-counts'),
		MarkDownFormatter = require('./markdown-formatter'),
		ListUtil = require('./list-util'),
		listUtil = new ListUtil(),
		markDownFormatter = new MarkDownFormatter(),
		steps = [],
		currentAssertions;
	self.defineStep = function (regexMatcher, processFunction) {
		steps.push({
			matcher: regexMatcher,
			processor: processFunction
		});
	};
	self.assertEquals = function (expected, actual, optionalOutputIndex) {
		var	passed = expected == actual;
		currentAssertions.push(new Assertion(expected, markDownFormatter.formatPrimitiveResult(expected, actual, passed), passed, optionalOutputIndex));
	};
	self.assertSetEquals = function (expected, actual, optionalOutputIndex) {
		var result = listUtil.unorderedMatch(expected, actual);
		currentAssertions.push(new Assertion(expected, markDownFormatter.formatListResult(result), result.matches, optionalOutputIndex));
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
		var matchingSteps = steps.filter(function (step) {
				return step.matcher.test(stepText);
			}),
			match,
			resultText,
			step,
			stepArgs;

		if (!regexUtil.assertionLine(stepText)) {
			resultBuffer.push(stepText);
			return;
		}

		if (matchingSteps.length === 0) {
			resultBuffer.push(stepText);
			counts.skipped++;
			return;
		} else if (matchingSteps.length > 1) {
			/* bork on multiple options possible */
			throw new Error('multiple steps match line ' + stepText);
		}
		step = matchingSteps[0];
		match = stepText.match(step.matcher);
		currentAssertions = [];
		stepArgs = match.slice(1);
		if (list) { /* we know it's a list and the symbol */
			stepArgs.push(list);
		}
		try {
			step.processor.apply(self, stepArgs);
			resultText = stepText;
			currentAssertions.forEach(function (assertion) {
				counts.increment(assertion);
			});
			resultBuffer.push(markDownFormatter.markResult(currentAssertions, stepText, step, list));
		} catch (e) {
			/* geniuine error, not assertion fail */
			resultBuffer.push('~~' + resultText + '~~');
			resultBuffer.push('\t' + e.stack);
			counts.recordException(e);
		}
	};
};
