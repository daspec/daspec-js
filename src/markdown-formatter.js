/*global module*/
(function () {
	'use strict';
	var MarkDownFormatter = function () {
		var self = this,
				dash = String.fromCharCode(8211),
				tick = String.fromCharCode(10003);

		self.formatPrimitiveResult = function (expected, actual, passed) {
			if (passed) {
				return '**' + expected + '**';
			} else {
				return '**~~' + expected + '~~ ['  + actual + ']**';
			}
		};
		self.formatListResult = function (listResult) {
			var tickEl = function (e) {
				return '[' + tick + '] ' + e;
			}, crossEl = function (e) {
				return '**[' + dash + '] ~~' + e + '~~**';
			}, plusEl = function (e) {
				return '**[+] ' + e + '**';
			},
				matching = (listResult.matching || []).map(tickEl),
				missing = (listResult.missing || []).map(crossEl),
				additional = (listResult.additional || []).map(plusEl);
			return matching.concat(missing, additional);
		};
	};
	module.exports = MarkDownFormatter;
})();
