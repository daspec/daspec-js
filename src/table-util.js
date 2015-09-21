/*global module, require*/
module.exports = function TableUtil() {
	'use strict';
	var self = this,
		RegexUtil = require ('./regex-util'),
		regexUtil = new RegexUtil(),
		Normaliser = require ('./normaliser'),
		normaliser = new Normaliser();

	self.cellValuesForRow = function (dataRow) {
		var values;
		if (!dataRow || dataRow.trim() === '') {
			return [];
		}
		values = dataRow.split('|');
		if (values.length < 3) {
			return [];
		}
		values.pop();
		values =  values.slice(1);
		return values.map(normaliser.normaliseValue);
	};
	self.tableValuesForTitles = function (table, titles) {
		var pickItems = function (tableRow) {
				return columnIndexes.map(function (val) {
					return tableRow[val];
				});
			},
			normalisedTitles,
			normalisedTableTitles,
			columnIndexes;
		if (!titles || titles.length === 0) {
			return false;
		}
		if (!table.titles) {
			return table.items;
		}
		normalisedTitles = titles.map(normaliser.normaliseString);
		normalisedTableTitles = table.titles.map(normaliser.normaliseString);
		columnIndexes = normalisedTitles.map(function (title) {
			return normalisedTableTitles.indexOf(title);
		});
		return table.items.map(pickItems);
	};
	self.objectArrayValuesForTitles = function (list, titles) {
		var normalisedTitles,
			pickItems = function (item) {
				if (Array.isArray(item)) {
					return item;
				}
				return normalisedTitles.map(function (title) {
					return item[title];
				});
			};
		if (!titles || titles.length === 0) {
			return false;
		}
		normalisedTitles = titles.map(normaliser.normaliseString);
		return list.map(normaliser.normaliseObject).map(pickItems);
	};
	self.justifyTable = function (stringArray) {
		var maxCellLengths = function (maxSoFar, tableRow, index) {
				var currentLengths;
				if (dividerRows[index]) {
					return maxSoFar;
				}
				currentLengths = tableRow.map(function (s) {
					return String(s).length;
				});
				if (!maxSoFar) {
					return currentLengths;
				} else {
					return currentLengths.map(function (v, i) {
						return Math.max(v, (maxSoFar[i] || 0));
					});
				}
			},
			cellValues = stringArray.map(self.cellValuesForRow),
			dividerRows = stringArray.map(regexUtil.isTableHeaderDivider),
			columnLengths = cellValues.reduce(maxCellLengths, []),
			padding = function (howMuch, padChar) {
				return new Array(howMuch + 1).join(padChar);
			},
			padCells = function (cells, rowIndex) {
				return cells.map(function (cellVal, index) {
					if (dividerRows[rowIndex]) {
						return padding(2 + columnLengths[index], '-');
					} else {
						return ' '  + cellVal + padding(1 + columnLengths[index] - String(cellVal).length, ' ');
					}
				});
			},
			joinCells = function (cells) {
				return '|' + cells.join('|')	+ '|';
			};
		return cellValues.map(padCells).map(joinCells);
	};
};
