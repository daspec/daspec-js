/*global module*/
module.exports = function CompositeResultFormatter() {
	'use strict';
	var self = this,
		formatters = [],
		dispatchTo = function (delegates, fname) {
			return function () {
				var fargs = arguments;
				delegates.forEach(function (formatter) {
					formatter[fname].apply(formatter, fargs);
				});
			};
		};
	self.add = function (formatter) {
		formatters.push(formatter);
	};
	['stepResult', 'nonAssertionLine', 'skippedLine', 'exampleStarted', 'exampleFinished'].forEach(function (fname) {
		self[fname] = dispatchTo(formatters, fname);
	});
	self.tableResultBlock = function () {
		var tableFormatters = formatters.map(function (formatter) {
				return formatter.tableResultBlock();
			}),
			result = {
				subFormatters: tableFormatters
			};
		['stepResult', 'nonAssertionLine'].forEach(function (fname) {
			result[fname] = dispatchTo(tableFormatters, fname);
		});
		return result;
	};
	self.appendResultBlock = function (resultBlock) {
		resultBlock.subFormatters.forEach(function (subFormatter, index) {
			formatters[index].appendResultBlock(subFormatter);
		});
	};
};
