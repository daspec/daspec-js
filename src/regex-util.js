/*global module*/
module.exports = function () {
	'use strict';
	var self = this;
	this.replaceMatchGroup = function (string, regex, overrides) {
		var match = string.match(regex),
			literalReplacement = regex.source,
			capturingGroup = /\([^)]*\)/,  /* todo: deal with non-capture groups */
			values = match.slice(1);
		overrides.forEach(function (replacement) {
			values[replacement.index] = replacement.value;
		});
		values.forEach(function (groupValue) {
			literalReplacement = literalReplacement.replace(capturingGroup, groupValue);
		});
		return string.replace(regex, literalReplacement);
	};
	this.isListItem = function (line) {
		if (/^[\*\s-=]*$/.test(line)) {
			return false;
		}
		if (!/^\s*[\*-]\s/.test(line)) {
			return false;
		}
		if (/^\s*\*\s/.test(line) && line.replace(/[^*]/g, '').length % 2 === 0) {
			return false;
		}
		return true;
	};
	this.stripListSymbol = function (line) {
		if (!self.isListItem(line)) {
			return line;
		}
		return line.replace(/^\s*[^\s]+\s/, '');
	};
	this.assertionLine = function (stepText) {
		if (stepText.length === 0 || stepText.trim().length === 0) {
			return false;
		}
		var linestartignores = ['#', '\t', '>', '    ', '![', '[', '***', '* * *', '---', '- - -', '===', '= = ='],
			result = true;
		linestartignores.forEach(function (lineStart) {
			if (stepText.substring(0, lineStart.length) === lineStart) {
				result = false;
			}
		});
		return result;
	};
};
