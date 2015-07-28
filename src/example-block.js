/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		lines = [];
	self.addLine = function (lineText) {
		lines.unshift(lineText);
	};
	self.isComplete = function () {
		if (lines.length === 0) {
			return false;
		}
		if (regexUtil.isListItem(lines[0])) {
			return false;
		}
		return true;
	};
	self.getList = function () {
		if (lines.length === 0) {
			return false;
		}
		var topLine = lines[0];
		if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
			return {ordered: false, items: lines.filter(regexUtil.isListItem).map(regexUtil.stripListSymbol)};
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
