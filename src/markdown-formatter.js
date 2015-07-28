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

	self.markResult = function (currentAssertions, stepText, step, list) {
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
				return assertion.expected === list.items && !assertion.passed;
			},
			noIndexAssertions = currentAssertions.filter(withoutIndex),
			headingLine = function () {
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
			attachmentLines = function () {
				if (!list) {
					return '';
				}
				var listAssertions = currentAssertions.filter(failedForList),
						values = list.items;
				if (listAssertions && listAssertions.length > 0) {
					values = listAssertions[0].value;
				}
				return values.map(function (e) {
					return '\n* ' + e;
				}).join(''); // TODO: deal with ordered lists
			};
		return headingLine() + attachmentLines();

	};
};
