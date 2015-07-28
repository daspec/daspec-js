/*global module*/
(function () {
	'use strict';
	var ListUtil = function () {
		var self = this;
		self.unorderedMatch = function (array1, array2) {
			var matching = array1.filter(function (el) {
					return array2.indexOf(el) >= 0;
				}),
				missing = array1.filter(function (el) {
					return array2.indexOf(el) < 0;
				}),
				additional = array2.filter(function (el) {
					return array1.indexOf(el) < 0;
				});
			return {
				matches: missing.length === 0 && additional.length === 0,
				missing: missing,
				additional: additional,
				matching: matching
			};
		};
	};
	module.exports = ListUtil;
})();
