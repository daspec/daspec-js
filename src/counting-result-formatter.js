/*global module, require*/
module.exports = function CountringResultFormatter() {
	'use strict';
	var self = this,
		AssertionCounts = require('./assertion-counts'),
		TableResultBlock = function () {
			var table = this;
			table.nonAssertionLine = function () { };
			table.stepResult = self.stepResult;
		};
	self.current = new AssertionCounts();
	self.total = new AssertionCounts();
	self.stepResult = function (result) {
		self.current.recordException(result.exception);
		result.assertions.forEach(function (assertion) {
			self.current.increment(assertion);
		});
	};
	self.nonAssertionLine = function () { };
	self.skippedLine = function () {
		self.current.skipped++;
	};
	self.appendResultBlock = function () { };
	self.tableResultBlock = function () {
		return new TableResultBlock();
	};
	self.exampleFinished = function () {
		self.total.incrementCounts(self.current);
	};
	self.exampleStarted = function () {
		self.current = new AssertionCounts();
	};
};
