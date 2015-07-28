/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		Assertion = require('./assertion'),
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
	self.executeStep = function (stepText, counts, resultBuffer) {
		self.executeListStep(stepText, undefined, counts, resultBuffer);
	};
	self.executeListStep = function (stepText, list, counts, resultBuffer) {
		var markResult = function () {
				var withoutIndex = function (assertion) {
						return !assertion.index;
					},
					withIndex = function (assertion) {
						return assertion.index;
					},
					failed = function (assertion) {
						return !assertion.passed;
					},
					failedForList = function (assertion) {
						return assertion.expected === list.items && !assertion.passed;
					},
					noIndexAssertions = currentAssertions.filter(withoutIndex),
					headingLine = function () {
						if (noIndexAssertions.length === 0) {
							return regexUtil.replaceMatchGroup(stepText, step.matcher, currentAssertions);
						}
						if (noIndexAssertions.some(failed)) {
							return '**~~' + stepText + '~~**';
						}
						if (currentAssertions.some(failed)) {
							return regexUtil.replaceMatchGroup(stepText, step.matcher, currentAssertions.filter(withIndex));
						}
						if (currentAssertions.length) {
							return '**' + stepText + '**';
						}
						return stepText;
					},
					attachmentLines = function () {
						if (!list) {
							return '';
						}
						var listAssertions = currentAssertions.filter(failedForList),
								values = list.items;
						if (listAssertions && listAssertions.length > 0) {
							values = listAssertions[0].value;
						}
						return values.map(function (e) {
							return '\n* ' + e;
						}).join(''); // TODO: deal with ordered lists
					};
				return headingLine() + attachmentLines();
			},
			matchingSteps = steps.filter(function (step) {
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
			resultBuffer.push(markResult());
		} catch (e) {
			/* geniuine error, not assertion fail */
			resultBuffer.push('~~' + resultText + '~~');
			resultBuffer.push('\t' + e.stack);
			counts.recordException(e);
		}
	};
};
