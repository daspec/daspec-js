/*global module, require*/
module.exports = function expectationBuilderExtensions() {
	'use strict';
	var TableUtil = require('./table-util'),
		tableUtil = new TableUtil(),
		Expect = require('daspec-matchers').Expect;

	return {
		toEqualUnorderedTable: function (expected) {
			var exp = this,
				comparisonObject,
				actual = exp.actual,
				tableExpect;

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
			tableExpect = new Expect(comparisonObject).toEqualSet(expected.items);
			exp.pushAssertions(tableExpect.assertions);
			return exp;

		}
	};

};
