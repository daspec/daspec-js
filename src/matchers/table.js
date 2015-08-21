/*global module, require*/
module.exports = {
	toEqualUnorderedTable: function (expected) {
		'use strict';
		var TableUtil = require('../table-util'),
			tableUtil = new TableUtil(),
			ListUtil = require('../list-util'),
			listUtil = new ListUtil(),
			actual = this.actual,
			comparisonObject,
			listResult;

		if (!expected.titles) {
			comparisonObject = actual;
			if (actual.type === 'table' && Array.isArray(actual.items)) {
				comparisonObject = actual.items;
			}
		} else {
			if (actual.type === 'table' && Array.isArray(actual.items)) {
				comparisonObject = tableUtil.tableValuesForTitles(actual, expected.titles);
			}	else {
				comparisonObject = tableUtil.objectArrayValuesForTitles(actual, expected.titles);
			}
		}
		listResult = listUtil.unorderedMatch(expected.items, comparisonObject);
		this.addAssertion(listResult.matches, expected, listResult);
		return this;
	}
};
