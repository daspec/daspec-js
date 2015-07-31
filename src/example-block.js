/*global module, require*/
module.exports = function ExampleBlock() {
	'use strict';
	var self = this,
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		lines = [],
		toLineItem = function (line) {
			return line.replace(/^\||\|$/g, '').split('|').map(function (s) {
				return s.trim();
			});
		},
		toItems = function (lines) {
			return lines.map(toLineItem);
		},
		toTable = function (lines) {
			var tableItems = lines, result = {type: 'table'};
			if (lines.length > 2 && regexUtil.isTableHeaderDivider(lines[1])) {
				result.titles =  toLineItem(lines[0]);
				tableItems = lines.slice(2);
			}
			result.items = toItems(tableItems);
			return result;
		},
		getAttachmentTable = function () {
			//TODO: complain if table has duplicated column titles or some columns have no titles
			//TODO: table column title normalisation (eg Top Price === topprice === TOP price)
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
			if (lines.length === 0) {
				return false;
			}
			var topLine = lines[0],
				listLines = lines.filter(regexUtil.isListItem);
			if (listLines.length === 0) {
				return false;
			}
			if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
				return {type: 'list', ordered: false, items: listLines.map(regexUtil.stripListSymbol)};
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
