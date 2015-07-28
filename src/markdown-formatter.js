/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
			RegexUtil = require('./regex-util'),
			regexUtil = new RegexUtil(),
			dash = String.fromCharCode(8211),
			tick = String.fromCharCode(10003);

	self.formatPrimitiveResult = function (expected, actual, passed) {
		if (passed) {
			return '**' + expected + '**';
		} else {
			return '**~~' + expected + '~~ ['  + actual + ']**';
		}
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
				return !assertion.index;
			},
			withIndex = function (assertion) {
				return assertion.index;
			},
			failed = function (assertion) {
				return !assertion.passed;
			},
			failedForList = function (assertion) {
				return assertion.expected === stepResult.list.items && !assertion.passed;
			},
			noIndexAssertions = stepResult.assertions.filter(withoutIndex),
			headingLine = function () {
				if (noIndexAssertions.length === 0) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions);
				}
				if (noIndexAssertions.some(failed)) {
					return '**~~' + stepResult.stepText + '~~**';
				}
				if (stepResult.assertions.some(failed)) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.filter(withIndex));
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
				var listAssertions = stepResult.assertions.filter(failedForList),
						values = stepResult.list.items;
				if (listAssertions && listAssertions.length > 0) {
					values = listAssertions[0].value;
				}
				return values.map(function (e) {
					return '\n* ' + e;
				}).join(''); // TODO: deal with ordered lists
			};
		if (stepResult.exception) {
			return '~~' + stepResult.stepText + '~~\n' + '\t' + stepResult.exception.stack; //TODO: push list as well
		}
		return headingLine() + attachmentLines();

	};
};
