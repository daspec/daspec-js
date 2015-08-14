/*global module, require*/
module.exports = function StepExecutor(regexMatcher, processFunction, specContext) {
	'use strict';
	var self = this,
		StepContext = require('./step-context'),
		TableUtil = require('./table-util'),
		RegExUtil = require('./regex-util'),
		Assertion = require('./assertion'),
		ExpectationBuilder = require('daspec-matchers').ExpectationBuilder,
		regexUtil = new RegExUtil();
	self.match = function (stepText) {
		if (stepText instanceof RegExp) {
			return regexMatcher.source === stepText.source;
		}
		return regexMatcher.test(stepText);
	};
	self.execute = function (stepText, attachment) {
		var stepArgs = regexUtil.getMatchedArguments(regexMatcher, stepText),
			result = {
				matcher: regexMatcher,
				stepText: stepText,
				attachment: attachment,
				assertions: []
			},
			stepContext = new StepContext(result),
			expectationBuilder;
		if (attachment) {
			stepArgs.push(attachment);
		}
		expectationBuilder = new ExpectationBuilder(stepArgs);
		if (specContext && specContext.setExpectationBuilder) {
			specContext.setExpectationBuilder(expectationBuilder);
		}
		try {
			processFunction.apply(stepContext, stepArgs);
			expectationBuilder.getAssertions().forEach(function (a) {
				result.assertions.push(new Assertion(a.expected, a.actual, a.passed, a.position));
			});
		} catch (e) {
			/* geniuine error, not assertion fail */
			result.exception = e;
		}


		return result;
	};
	self.executeTableRow = function (dataRow, titleRow) {
		var tableUtil = new TableUtil(),
			stepArgs = tableUtil.cellValuesForRow(dataRow),
			matcher = regexUtil.regexForTableDataRow(stepArgs.length),
			result = {
				matcher: matcher,
				stepText: dataRow,
				assertions: []
			},
			stepContext = new StepContext(result),
			titleMatch = titleRow && titleRow.match(regexMatcher),
			titleArgs = titleMatch && titleMatch.length > 1 && titleMatch.slice(1).map(function (item) {
				return item.trim();
			});

		if (titleArgs) {
			stepArgs = stepArgs.concat(titleArgs);
		}
		processFunction.apply(stepContext, stepArgs);

		return result;
	};
};
