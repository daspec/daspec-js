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
		getAttachmentTable = function () {
			if (lines.length === 0) {
				return false;
			}
			var topLine = lines[0],
				tableLines = lines.filter(regexUtil.isTableItem);
			if (tableLines.length === 0) {
				return false;
			}
			if (!regexUtil.isTableItem(topLine) && regexUtil.assertionLine(topLine)) {
				return toTable(tableLines);
			}
			return false;
		},
		getAttachmentList = function () {
			//TODO: support nested lists
			if (lines.length === 0) {
				return false;
			}
			var topLine = lines[0],
				listLines = lines.filter(regexUtil.isListItem),
				listSymbol;
			if (listLines.length === 0) {
				return false;
			}
			listSymbol = regexUtil.getListSymbol(listLines[0]);
			if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
				return {type: 'list',
					ordered: !isNaN(parseFloat(listSymbol)),
					items: listLines.map(regexUtil.stripListSymbol),
					symbol: listSymbol
				};
			}
			return false;
		};
	self.addLine = function (lineText) {
		lines.unshift(lineText);
	};
	self.isComplete = function () {
		if (lines.length === 0) {
			return false;
		}
		if (regexUtil.isListItem(lines[0]) || regexUtil.isTableItem(lines[0]) || lines[0].trim().length === 0) {
			return false;
		}
		return true;
	};
	self.getAttachment = function () {
		return getAttachmentList() || getAttachmentTable();
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
