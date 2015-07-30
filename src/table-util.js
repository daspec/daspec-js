/*global module*/
module.exports = function TableUtil() {
	'use strict';
	var self = this;
	self.normaliseTitle = function (string) {
		return string.toLocaleLowerCase().replace(/\s/g, '');
	};
	self.normaliseObject = function (object) {
		var result = {};
		Object.keys(object).forEach(function (key) {
			result[self.normaliseTitle(key)] = object[key];
		});
		return result;
	};
	//TODO: validate table. eg multiple columns matching same normalised title so non-deterministic results
	self.tableValuesForTitles = function (table, titles) {
		if (!titles || titles.length === 0) {
			return false;
		}
		var pickItems = function (tableRow) {
					return columnIndexes.map(function (val) {
						return tableRow[val];
					});
				},
				normalisedTitles = titles.map(self.normaliseTitle),
				normalisedTableTitles = table.titles.map(self.normaliseTitle),
				columnIndexes = normalisedTitles.map(function (title) {
					return normalisedTableTitles.indexOf(title);
				});
		return table.items.map(pickItems);
	};
	self.objectArrayValuesForTitles = function (list, titles) {
		if (!titles || titles.length === 0) {
			return false;
		}
		var normalisedTitles = titles.map(self.normaliseTitle),
				pickItems = function (item) {
					return normalisedTitles.map(function (title) {
						return item[title];
					});
				};
		return list.map(self.normaliseObject).map(pickItems);
	};
};
