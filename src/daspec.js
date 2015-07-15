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
			this.isListItem = function (line) {
				if (/^[\*\s-=]*$/.test(line)) {
					return false;
				}
				if (!/^\s*[\*-]\s/.test(line)) {
					return false;
				}
				if (/^\s*\*\s/.test(line) && line.replace(/[^*]/g, '').length % 2 === 0) {
					return false;
				}
				return true;
			};
			this.assertionLine = function (stepText) {
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
			self.assertArrayEquals = function (expected, actual) {
				currentAssertions.push(new Assertion(expected, actual, true));
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
					}),
					match,
					resultText,
					step;

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
		ExampleBlocks = function (inputText) {
			var self = this;
			self.getBlocks = function () {
				var lines = inputText && inputText.split('\n').reverse(),
					current = new ExampleBlock(),
					blocks = [];
				lines.forEach(function (line) {
					current.addLine(line);
					if (current.isComplete()) {
						blocks.push(current);
						current = new ExampleBlock();
					}
				});
				if (current.getMatchText()) {
					blocks.push(current);
				}
				return blocks.reverse();
			};
		},
		ExampleBlock = function () {
			var self = this,
				regexUtil = new RegexUtil(),
				lines = [];
			self.addLine = function (lineText) {
				lines.unshift(lineText);
			};
			self.isComplete = function () {
				if (lines.length === 0) {
					return false;
				}
				if (regexUtil.isListItem(lines[0])) {
					return false;
				}
				return true;
			};
			self.getList = function () {
				if (lines.length === 0) {
					return false;
				}
				var topLine = lines[0];
				if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
					return lines.filter(regexUtil.isListItem);
				}
				return false;
			};
			self.getMatchText = function () {
				if (lines.length === 0) {
					return false;
				}
				var topLine = lines[0];
				if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
					return [topLine];
				} else {
					return lines;
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
					resultBuffer = [],
					blocks = new ExampleBlocks(inputText);
				blocks.getBlocks().forEach(function (block) {
					var blockLines = block.getMatchText(),
						blockList = block.getList();
					if (blockLines) {
						//TODO: at the moment we are not foing anything with the list, just passing it to the result buffer, it should be passed to execute step and processed
						blockLines.forEach(function (line) {
							context.executeStep(line, counts, resultBuffer);
						});
						if (blockList) {
							blockList.forEach(function (listLine) {
								resultBuffer.push(listLine);
							});
						}
					}
				});
				resultBuffer.unshift('');
				resultBuffer.unshift(countDescription(counts));
				return resultBuffer.join('\n');
			};
		};
	module.exports = {
		Runner: Runner,
		RegexUtil: RegexUtil,
		ExampleBlock: ExampleBlock
	};
})();
