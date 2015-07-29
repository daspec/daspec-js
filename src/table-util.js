/*global module*/
module.exports = function TableUtil() {
	'use strict';
	var self = this,
			toObject = function (valueArray) {
				var result = {};
				this.forEach(function (v, i) {
					result[v] = valueArray[i];
				});
				return result;
			};
	self.normaliseTitle = function (string) {
		return string.toLocaleLowerCase();
	};
	self.toHashArray = function (tableWithTitles) {
		if (!tableWithTitles || tableWithTitles.type !== 'table' || !tableWithTitles.titles || !tableWithTitles.titles.length || !tableWithTitles.items || !tableWithTitles.items.length) {
			return [];
		}
		return tableWithTitles.items.map(toObject, tableWithTitles.titles.map(self.normaliseTitle));
	};
};
