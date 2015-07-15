/*global module, JSON*/

(function () {
	'use strict';
	var AssertionCounts = function () {
			var self = this;
			self.executed = 0;
			self.passed = 0;
			self.failed = 0;
			self.error = 0;
			self.skipped = 0;
			self.increment = function (assertion) {
				self.executed++;
				if (assertion.passed) {
					self.passed++;
				} else {
					self.failed++;
				}
			};
			self.recordException = function (exception) {
				if (exception) {
					self.error++;
				}
			};
			self.currentCounts = function () {
				return JSON.parse(JSON.stringify(self));
			};
		},
		Assertion = function (expected, actual, passed, outputIndex) {
			var self = this,
					calcValue = function () {
						if (passed) { /* todo - deal with non index */
							return '**' + actual + '**';
						} else {
							return '**~~' + expected + '~~ ['  + actual + ']**';
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
					assertionLine = function () {
						if (stepText.length === 0 || stepText.trim().length === 0) {
							return false;
						}
						var linestartignores = ['#', '\t', '>', '    ', '![', '[', '***', '* * *', '---', '- - -', '===', '= = ='],
							result = true;
						linestartignores.forEach(function (lineStart) {
							if (stepText.substring(0, lineStart.length) === lineStart) {
								result = false;
							}
						});
						return result;
					},
					matchingSteps = steps.filter(function (step) {
						return step.matcher.test(stepText);
					}),
					match,
					resultText,
					step;

				if (!assertionLine()) {
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
				try {
					step.processor.apply(self, match.slice(1));
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
		},
		Runner = function (stepFunc) {
			var context = new Context(),
				self = this,
				countDescription = function (counts) {
					var labels = ['executed', 'passed', 'failed', 'error', 'skipped'],
						description = '> **In da spec:** ',
						comma = false;

					labels.forEach(function (label) {
						if (counts[label]) {
							if (comma) {
								description = description + ', ';
							} else {
								comma = true;
							}
							description = description + label + ': ' + counts[label];
						}
					});
					if (!comma) {
						description = description + 'Nada';
					}
					return description;
				};
			stepFunc(context);

			self.example = function (inputText) {
				var counts = new AssertionCounts(),
					resultBuffer = [];
				inputText.split('\n').forEach(function (line) {
					context.executeStep(line, counts, resultBuffer);
				});
				resultBuffer.unshift('');
				resultBuffer.unshift(countDescription(counts));
				return resultBuffer.join('\n');
			};
		};
	module.exports = {
		Runner: Runner,
		RegexUtil: RegexUtil
	};
})();
