/*global module, require*/
module.exports = function (regexMatcher, processFunction) {
	'use strict';
	var self = this,
		Assertion = require('./assertion');

	self.match = function (stepText) {
		return regexMatcher.test(stepText);
	};
	self.execute = function (stepText, list) {
		var match = stepText.match(regexMatcher),
			stepArgs = match.slice(1),
			result = {
				matcher: regexMatcher,
				stepText: stepText,
				list: list,
				assertions: []
			},
			StepContext = function () {
				var self = this,
					ListUtil = require('./list-util'),
					listUtil = new ListUtil(),
					MarkDownFormatter = require('./markdown-formatter'),
					markDownFormatter = new MarkDownFormatter();
				self.assertEquals = function (expected, actual, optionalOutputIndex) {
					var	passed = expected == actual;
					result.assertions.push(new Assertion(expected, markDownFormatter.formatPrimitiveResult(expected, actual, passed), passed, optionalOutputIndex));
				};
				self.assertSetEquals = function (expected, actual, optionalOutputIndex) {
					var listResult = listUtil.unorderedMatch(expected, actual);
					result.assertions.push(new Assertion(expected, markDownFormatter.formatListResult(listResult), listResult.matches, optionalOutputIndex));
				};
			};

		if (list) { /* we know it's a list and the symbol */
			stepArgs.push(list);
		}

		try {
			processFunction.apply(new StepContext(), stepArgs);
		} catch (e) {
			/* geniuine error, not assertion fail */
			result.exception = e;
		}


		return result;
	};
};
