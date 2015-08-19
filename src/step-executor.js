/*global module, require*/
module.exports = function StepExecutor(regexMatcher, processFunction, specContext) {
	'use strict';
	var self = this,
		TableUtil = require('./table-util'),
		tableUtil = new TableUtil(),
		RegExUtil = require('./regex-util'),
		Assertion = require('./assertion'),
		ExpectationBuilder = require('./expectation-builder'),
		regexUtil = new RegExUtil(),
		expectExtensions = require('./matchers/table');

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
			expectationBuilder;
		if (attachment) {
			stepArgs.push(attachment);
		}
		expectationBuilder = new ExpectationBuilder(stepArgs, expectExtensions);
		if (specContext && specContext.setExpectationBuilder) {
			specContext.setExpectationBuilder(expectationBuilder);
		}
		try {
			processFunction.apply(specContext, stepArgs);
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
		var stepArgs = tableUtil.cellValuesForRow(dataRow),
			matcher = regexUtil.regexForTableDataRow(stepArgs.length),
			result = {
				matcher: matcher,
				stepText: dataRow,
				assertions: []
			},
			titleMatch = titleRow && titleRow.match(regexMatcher),
			titleArgs = titleMatch && titleMatch.length > 1 && titleMatch.slice(1).map(function (item) {
				return item.trim();
			}),
			expectationBuilder;

		if (titleArgs) {
			stepArgs = stepArgs.concat(titleArgs);
		}
		expectationBuilder = new ExpectationBuilder(stepArgs, expectExtensions);
		if (specContext && specContext.setExpectationBuilder) {
			specContext.setExpectationBuilder(expectationBuilder);
		}

		processFunction.apply(specContext, stepArgs);
		expectationBuilder.getAssertions().forEach(function (a) {
			result.assertions.push(new Assertion(a.expected, a.actual, a.passed, a.position));
		});

		return result;
	};
};
