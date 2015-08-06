/*global module, require*/
module.exports = function MarkDownFormatter() {
	'use strict';
	var self = this,
			RegexUtil = require('./regex-util'),
			TableUtil = require('./table-util'),
			regexUtil = new RegexUtil(),
			tableUtil = new TableUtil(),
			dash = String.fromCharCode(8211),
			tick = String.fromCharCode(10003),
			crossValueAndExpected = function (expected, actual) {
				var formatActual = '';
				if (actual !== undefined) {
					formatActual = ' ['  + actual + ']';
				}
				return '**~~' + expected + '~~'  + formatActual + '**';
			},
			crossValue = function (expected) {
				return '**~~' + expected + '~~**';
			},
			boldValue = function (expected) {
				return '**' + expected + '**';
			};
	self.formatPrimitiveResult = function (assertion) {
		var formattedValue = function () {
			if (assertion.passed) {
				return boldValue(assertion.expected);
			} else {
				return crossValueAndExpected(assertion.expected, assertion.value);
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
	self.getTableResult = function (tableResult) {
		var tickRow = function (row) {
			return [tick].concat(row);
		}, crossRow = function (row) {
			return [dash].concat(row.map(crossValue));
		}, plusRow = function (row) {
			return ['+'].concat(row.map(boldValue));
		},
			matching = (tableResult.matching || []).map(tickRow),
			missing = (tableResult.missing || []).map(crossRow),
			additional = (tableResult.additional || []).map(plusRow);
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
			passed = function (assertion) {
				return assertion.passed;
			},
			forAttachment = function (assertion) {
				return stepResult.attachment && stepResult.attachment.items && stepResult.attachment.items.length > 0 &&
					(assertion.expected === stepResult.attachment.items || assertion.expected == stepResult.attachment);
			},
			headingLine = function () {
				if (stepResult.exception) {
					return crossValue(stepResult.stepText);
				}
				var noIndexAssertions = stepResult.assertions.filter(withoutIndex);
				if (noIndexAssertions.length === 0) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.map(self.formatPrimitiveResult));
				}
				if (noIndexAssertions.some(failed)) {
					if (regexUtil.isListItem(stepResult.stepText)) {
						return regexUtil.getListSymbol(stepResult.stepText) + '**~~' + regexUtil.stripListSymbol(stepResult.stepText) + '~~**';
					} else if (regexUtil.isTableItem(stepResult.stepText)) {
						return '| ' + tableUtil.cellValuesForRow(stepResult.stepText).map(crossValue).join(' | ') + ' |';
					} else {
						return crossValue(stepResult.stepText);
					}
				}
				if (stepResult.assertions.some(failed)) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.filter(withIndex).map(self.formatPrimitiveResult));
				}
				if (stepResult.assertions.length) {
					if (regexUtil.isListItem(stepResult.stepText)) {
						return regexUtil.getListSymbol(stepResult.stepText) + '**' + regexUtil.stripListSymbol(stepResult.stepText) + '**';
					} else if (regexUtil.isTableItem(stepResult.stepText)) {
						return '| ' + tableUtil.cellValuesForRow(stepResult.stepText).map(boldValue).join(' | ') + ' |';
					} else {
						return boldValue(stepResult.stepText);
					}
				}
				return stepResult.stepText;
			},
			attachmentLines = function () {
				if (!stepResult.attachment) {
					return '';
				}
				var formatList = function () {
						if (stepResult.attachment.type !== 'list') {
							return false;
						}
						var failedListAssertions = stepResult.assertions.filter(failed).filter(forAttachment),
							values = stepResult.attachment.items,
							symbol = stepResult.attachment.symbol || '* ';
						if (failedListAssertions && failedListAssertions.length > 0) {
							values = self.formatListResult(failedListAssertions[0].value);
						}
						return '\n' + symbol + values.join('\n' + symbol);
					},
					formatTableItem = function (item) {
						return '|' + item.join('|') + '|';
					},
					formatTable = function () {
						if (stepResult.attachment.type !== 'table') {
							return false;
						}
						var resultTitles = stepResult.attachment.titles && stepResult.attachment.titles.slice(0),
								failedTableAssertions = stepResult.assertions.filter(failed).filter(forAttachment),
								passedTableAssertions = stepResult.assertions.filter(passed).filter(forAttachment),
								values = stepResult.attachment.items,
								resultRows = [];
						if (failedTableAssertions && failedTableAssertions.length > 0) {
							if (resultTitles) {
								resultTitles.unshift('?');
							}
							values = self.getTableResult(failedTableAssertions[0].value);
						} else if (passedTableAssertions && passedTableAssertions.length > 0) {
							if (resultTitles) {
								resultTitles.unshift('?');
							}
							values =  self.getTableResult({matching: stepResult.attachment.items});
						}
						if (resultTitles) {
							resultRows.push(formatTableItem(resultTitles));
							resultRows.push(resultTitles.map(function () {
								return '|-';
							}).join('') + '|');
						}
						resultRows = resultRows.concat(values.map(formatTableItem));
						return '\n' + tableUtil.justifyTable(resultRows).join('\n');
					};
				return formatList() || formatTable();
			},
			exceptionReport = function () {
				if (!stepResult.exception) {
					return '';
				}
				return '\n<!--\n' + stepResult.exception + '\n-->';
			};
		return headingLine() + attachmentLines() + exceptionReport();
	};
};
