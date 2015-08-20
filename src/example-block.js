/*global module, require*/
module.exports = function ExampleBlock() {
	'use strict';
	var self = this,
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		TableUtil = require('./table-util'),
		tableUtil = new TableUtil(),
		Normaliser = require('./normaliser'),
		normaliser = new Normaliser(),
		lines = [],
		toItems = function (lines) {
			return lines.map(tableUtil.cellValuesForRow);
		},
		toTable = function (lines) {
			var tableItems = lines, result = {type: 'table'};
			if (lines.length > 2 && regexUtil.isTableHeaderDivider(lines[1])) {
				result.titles =  tableUtil.cellValuesForRow(lines[0]);
				if (normaliser.containsDuplicates(result.titles)) {
					throw new SyntaxError('Attachment table has multiple equivalent column names');
				}
				if (result.titles.some(regexUtil.isEmpty)) {
					throw new SyntaxError('Attachment table has a column without a name');
				}
				tableItems = lines.slice(2);
			}
			result.items = toItems(tableItems);
			return result;
		},

		getAttachmentTable = function (tableLines) {
			if (!regexUtil.isTableItem(tableLines[0])) {
				return false;
			}
			return toTable(tableLines);
		},
		getAttachmentList = function (listLines) {
			if (!regexUtil.isListItem(listLines[0])) {
				return false;
			}
			var listSymbol = regexUtil.getListSymbol(listLines[0]);
			return {type: 'list',
				ordered: !isNaN(parseFloat(listSymbol)),
				items: listLines.map(regexUtil.lineItemContent),
				symbol: listSymbol
			};
		};
	self.addLine = function (lineText) {
		lines.unshift(lineText);
	};
	self.getAttachment = function () {
		var attachmentLines = self.getAttachmentLines().filter(regexUtil.assertionLine);

		if (attachmentLines.length === 0) {
			return false;
		}
		return getAttachmentList(attachmentLines) || getAttachmentTable(attachmentLines);
	};
	self.getAttachmentLines = function () {
		if (lines.length === 0) {
			return [];
		}
		var topLine = lines[0],
			isAttachmentLine = function (line) {
				return regexUtil.isTableItem(line) || regexUtil.isListItem(line);
			};
		if (!regexUtil.assertionLine(topLine) || regexUtil.isTableItem(topLine) || regexUtil.isListItem(topLine)) {
			return [];
		}
		return lines.filter(isAttachmentLine);
	};
	self.canAddLine = function (line) {
		if (lines.length === 0) {
			return true;
		}
		var lineType = function (theLine) {
				if (regexUtil.isListItem(theLine)) {
					return 'list';
				} else if (regexUtil.isTableItem(theLine)) {
					return 'table';
				} else if (regexUtil.assertionLine(theLine)) {
					return 'assertion';
				} else if (regexUtil.isEmpty(theLine)) {
					return 'empty';
				} else {
					return 'comment';
				}
			},
			topline = lines[0],
			newLineType = lineType(line),
			topLineType = lineType(topline);

		if (topLineType == 'assertion') {
			return false;
		}

		switch (newLineType) {
			case 'list':
			case 'table':
			case 'comment':
				return topLineType === newLineType;
			case 'assertion':
			case 'empty':
				return ['table', 'list', 'empty'].indexOf(topLineType) >= 0;
		}
		return false;
	};
	self.isTableBlock = function () {
		var tableLines = lines.filter(regexUtil.isTableItem),
			nonTableAssertionLine = function (line) {
				return regexUtil.assertionLine(line) && !regexUtil.isTableItem(line);
			};
		if (tableLines.length === 0) {
			return false;
		}
		if (lines.filter(nonTableAssertionLine).length > 0) {
			return false;
		}
		return true;
	};

	self.getMatchText = function () {
		if (lines.length === 0) {
			return [];
		}
		var nonAttachmentLine = function (line) {
				return !regexUtil.isListItem(line) && !regexUtil.isTableItem(line);
			},
			topLine = lines[0];
		if (nonAttachmentLine(topLine) && regexUtil.assertionLine(topLine)) {
			return lines.filter(nonAttachmentLine);
		} else {
			return lines;
		}
	};
};
