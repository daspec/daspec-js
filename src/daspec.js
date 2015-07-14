/*global module*/

(function () {
	'use strict';
	var AssertionError = function (expected, actual, outputIndex) {
			this.expected = expected;
			this.actual = actual;
			this.outputIndex = outputIndex;
		},
		RegexUtil = function () {
			this.replaceMatchGroup = function (string, regex, matchGroupIndex, value) {
				var match = string.match(regex),
					literalReplacement = regex.source,
					capturingGroup = /\([^)]*\)/,  /* todo: deal with non-capture groups */
					values = match.slice(1);
				values[matchGroupIndex] = value;
				values.forEach(function (groupValue) {
					literalReplacement = literalReplacement.replace(capturingGroup, groupValue);
				});
				return string.replace(regex, literalReplacement);
			};
		},
		Context = function () {
			var self = this,
				regexUtil = new RegexUtil(),
				step;
			self.defineStep = function (regexMatcher, processFunction) {
				step = {
					matcher: regexMatcher,
					processor: processFunction
				};
			};
			self.assertEquals = function (expected, actual, optionalOutputIndex) {
				if (expected != actual) {
					throw new AssertionError(expected, actual, optionalOutputIndex);
				}
			};
			self.executeStep = function (stepText, counts, resultBuffer) {
				var match = stepText.match(step.matcher);
				if (match) {
					try {
						step.processor.apply(self, match.slice(1));
						resultBuffer.push(stepText);
					} catch (e) {
						resultBuffer.push(regexUtil.replaceMatchGroup(stepText, step.matcher, e.outputIndex, '**~~' + e.expected + '~~ ['  + e.actual + ']**'));
						counts.failed += 1;
					}
					counts.executed += 1;
				} else {
					resultBuffer.push(stepText);
					counts.skipped += 1;
				}

			};
		},
		Runner = function (stepFunc) {
			var context = new Context(),
					self = this;
			stepFunc(context);
			self.example = function (inputText) {
				var counts = {executed: 0, failed: 0, skipped: 0},
						resultBuffer = [];
				context.executeStep(inputText, counts, resultBuffer);
				return {
					output: resultBuffer.join('\n'),
					counts: counts
				};
			};
		};
	module.exports = {
		Runner: Runner,
		RegexUtil: RegexUtil,
		ping: function () {
			return 'pong';
		}
	};
})();
