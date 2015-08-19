/*global module, require*/
module.exports = {
	toEqualSet: function (expected) {
		'use strict';
		var	ListUtil = require('../list-util'),
			listUtil = new ListUtil(),
			listResult = listUtil.unorderedMatch(expected, this.actual);
		this.addAssertion(listResult.matches, expected, listResult);
		return this;
	}
};
