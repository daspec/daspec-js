/*global module, require*/
module.exports = {
	toEqualSet: function (expected) {
		'use strict';

		var	parseExpected = function () {
				if (!expected) {
					return [];
				}
				if (Array.isArray(expected)) {
					return expected;
				}
				if (expected.items && Array.isArray(expected.items)) {
					return expected.items;
				}
				return [];
			},
			ListUtil = require('../list-util'),
			listUtil = new ListUtil(),
			listResult = listUtil.unorderedMatch(parseExpected(), this.actual);
		this.addAssertion(listResult.matches, expected, listResult);
		return this;
	}
};
