/*global module*/

(function () {
	'use strict';
	var Assertion = function (expected, actual, passed, outputIndex) {
			var self = this,
					calcValue = function () {
						if (passed) { /* todo - deal with non index */
							return '**' + actual + '**';
						} else {
							return '**~~' + expected + '~~ ['  + actual + ']**';
						}
					};
			self.incrementCounts = function (counts) {
				counts.executed += 1;
				if (passed) {
					counts.passed += 1;
				} else {
					counts.failed += 1;
				}
			};
			self.value = calcValue();
			self.index = outputIndex;
			self.passed = passed;
		},
		RegexUtil = function () {
			this.replaceMatchGroup = function (string, regex, overrides) {
				var match = string.match(regex),
					literalReplacement = regex.source,
					capturingGroup = /\([^)]*\)/,  /* todo: deal with non-capture groups */
					values = match.slice(1);
				overrides.forEach(function (replacement) {
					values[replacement.index] = replacement.value;
				});
				values.forEach(function (groupValue) {
					literalReplacement = literalReplacement.replace(capturingGroup, groupValue);
				});
				return string.replace(regex, literalReplacement);
			};
		},
		Context = function () {
			var self = this,
				regexUtil = new RegexUtil(),
				steps = [],
				currentAssertions;
			self.defineStep = function (regexMatcher, processFunction) {
				steps.push({
					matcher: regexMatcher,
					processor: processFunction
				});
			};
			self.assertEquals = function (expected, actual, optionalOutputIndex) {
				currentAssertions.push(new Assertion(expected, actual, expected == actual, optionalOutputIndex));
			};
			self.executeStep = function (stepText, counts, resultBuffer) {
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
						noIndexAssertions = currentAssertions.filter(withoutIndex);
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
				matchingSteps = steps.filter(function (step) {
					return step.matcher.test(stepText);
				}), match, resultText, step;
				if (matchingSteps.length === 0) {
					resultBuffer.push(stepText);
					counts.skipped += 1;
					return;
				} else if (matchingSteps.length > 1) {
					/* bork on multiple options possible */
					throw new Error('multiple steps match line ' + stepText);
				}
				step = matchingSteps[0];
				match = stepText.match(step.matcher);
				currentAssertions = [];
				try {
					step.processor.apply(self, match.slice(1));
					resultText = stepText;
					currentAssertions.forEach(function (assertion) {
						assertion.incrementCounts(counts);
					});
					resultBuffer.push(markResult());
				} catch (e) {
					/* geniuine error, not assertion fail */
					resultBuffer.push('~~' + resultText + '~~');
					resultBuffer.push('\t' + e.stack);
					counts.error += 1;
				}
			};
		},
		Runner = function (stepFunc) {
			var context = new Context(),
					self = this;
			stepFunc(context);
			self.example = function (inputText) {
				var counts = {executed: 0, failed: 0, skipped: 0, passed: 0, error: 0},
						resultBuffer = [];
				inputText.split('\n').forEach(function (line) {
					context.executeStep(line, counts, resultBuffer);
				});
				return {
					output: resultBuffer.join('\n'),
					counts: counts
				};
			};
		};
	module.exports = {
		Runner: Runner,
		RegexUtil: RegexUtil
	};
})();
