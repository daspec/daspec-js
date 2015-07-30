/*global module, require*/
module.exports = function StepExecutor(regexMatcher, processFunction) {
	'use strict';
	var self = this,
		StepContext = require('./step-context'),
		TableUtil = require('./table-util'),
		RegExUtil = require('./regex-util');
	self.match = function (stepText) {
		return regexMatcher.test(stepText);
	};
	self.execute = function (stepText, attachment) {
		var match = stepText.match(regexMatcher),
			stepArgs = match.slice(1),
			result = {
				matcher: regexMatcher,
				stepText: stepText,
				attachment: attachment,
				assertions: []
			},
			stepContext = new StepContext(result);

		if (attachment) { /* we know it's a list and the symbol */
			stepArgs.push(attachment);
		}

		try {
			processFunction.apply(stepContext, stepArgs);
		} catch (e) {
			/* geniuine error, not assertion fail */
			result.exception = e;
		}


		return result;
	};
	self.executeTableRow = function (dataRow, titleRow) {
		var tableUtil = new TableUtil(),
			regexUtil = new RegExUtil(),
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
