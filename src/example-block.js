/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		lines = [],
		toItems = function (lines) {
			return lines.map(function (line) {
				return line.replace(/^\||\|$/g, '').split('|').map(function (s) {
					return s.trim();
				});
			});
		},
		toTable = function (lines) {
			return {
				type: 'table',
				items: toItems(lines)
			};
		};
	self.addLine = function (lineText) {
		lines.unshift(lineText);
	};
	self.isComplete = function () {
		if (lines.length === 0) {
			return false;
		}
		if (regexUtil.isListItem(lines[0]) || regexUtil.isTableItem(lines[0])) {
			return false;
		}
		return true;
	};
	self.getParam = function () {
		return self.getList() || self.getTable();
	};
	self.getTable = function () {
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
	};
	self.getList = function () {
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
	self.getMatchText = function () {
		if (lines.length === 0) {
			return false;
		}
		var topLine = lines[0];
		if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
			return [topLine];
		} else {
			return lines;
		}
	};

};
