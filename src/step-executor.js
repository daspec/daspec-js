/*global module, require*/
module.exports = function StepExecutor(regexMatcher, processFunction, specContext) {
	'use strict';
	var self = this,
		TableUtil = require('./table-util'),
		tableUtil = new TableUtil(),
		RegExUtil = require('./regex-util'),
		Step = require('./step'),
		regexUtil = new RegExUtil();

	self.match = function (stepText) {
		if (stepText instanceof RegExp) {
			return regexMatcher.source === stepText.source;
		}
		return regexMatcher.test(stepText);
	};
	self.execute = function (stepText, attachment) {
		var step = new Step(specContext, processFunction);
		step.stepArgs = regexUtil.getMatchedArguments(regexMatcher, stepText);
		step.matcher = regexMatcher;
		step.stepText = stepText;
		step.attachment = attachment;
		if (attachment) {
			step.stepArgs.push(attachment);
		}
		step.execute();
		return step;
	};
	self.executeTableRow = function (dataRow, titleRow) {
		var titleMatch = titleRow && titleRow.match(regexMatcher),
			titleArgs = titleMatch && titleMatch.length > 1 && titleMatch.slice(1).map(function (item) {
				return item.trim();
			}),
			step = new Step(specContext, processFunction);
		step.stepArgs = tableUtil.cellValuesForRow(dataRow);
		step.matcher = regexUtil.regexForTableDataRow(step.stepArgs.length);
		step.stepText = dataRow;
		if (titleArgs) {
			step.stepArgs = step.stepArgs.concat(titleArgs);
		}
		step.execute();
		return step;
	};
};
