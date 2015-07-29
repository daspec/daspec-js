/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
			RegexUtil = require('./regex-util'),
			regexUtil = new RegexUtil(),
			dash = String.fromCharCode(8211),
			tick = String.fromCharCode(10003);

	self.formatPrimitiveResult = function (assertion) {
		var formattedValue = function () {
			if (assertion.passed) {
				return '**' + assertion.expected + '**';
			} else {
				return '**~~' + assertion.expected + '~~ ['  + assertion.value + ']**';
			}
		};
		return {
			index: assertion.index,
			value: formattedValue()
		};
	};
	self.formatListResult = function (listResult) {
		var tickEl = function (e) {
			return '[' + tick + '] ' + e;
		}, crossEl = function (e) {
			return '**[' + dash + '] ~~' + e + '~~**';
		}, plusEl = function (e) {
			return '**[+] ' + e + '**';
		},
			matching = (listResult.matching || []).map(tickEl),
			missing = (listResult.missing || []).map(crossEl),
			additional = (listResult.additional || []).map(plusEl);
		return matching.concat(missing, additional);
	};

	self.markResult = function (stepResult) {
		var withoutIndex = function (assertion) {
				return !assertion.index && assertion.index !== 0;
			},
			withIndex = function (assertion) {
				return assertion.index;
			},
			failed = function (assertion) {
				return !assertion.passed;
			},
			failedForList = function (assertion) {
				return stepResult.list && stepResult.list.items && stepResult.list.items.length > 0 &&
					assertion.expected === stepResult.list.items && !assertion.passed;
			},
			noIndexAssertions = stepResult.assertions.filter(withoutIndex),
			headingLine = function () {
				if (noIndexAssertions.length === 0) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.map(self.formatPrimitiveResult));
				}
				if (noIndexAssertions.some(failed)) {
					return '**~~' + stepResult.stepText + '~~**';
				}
				if (stepResult.assertions.some(failed)) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.filter(withIndex).map(self.formatPrimitiveResult));
				}
				if (stepResult.assertions.length) {
					return '**' + stepResult.stepText + '**';
				}
				return stepResult.stepText;
			},
			attachmentLines = function () {
				if (!stepResult.list) {
					return '';
				}
				var formatList = function () {
						if (stepResult.list.type !== 'list') {
							return false;
						}
						var failedListAssertions = stepResult.assertions.filter(failedForList),
								values = stepResult.list.items;
						if (failedListAssertions && failedListAssertions.length > 0) {
							values = self.formatListResult(failedListAssertions[0].value);
						}
						return values.map(function (e) {
							return '\n* ' + e;
						}).join(''); // TODO: deal with ordered lists
					},
					formatTable = function () {
						if (stepResult.list.type !== 'table') {
							return false;
						}
						return stepResult.list.items.map(function (item) {
							return '\n| ' + item.join(' | ') + ' |';
						}).join('');
					};
				return formatList() || formatTable();
			};
		if (stepResult.exception) {
			return '~~' + stepResult.stepText + '~~\n' + '\t' + stepResult.exception.stack; //TODO: push list as well
		}
		return headingLine() + attachmentLines();

	};
};
