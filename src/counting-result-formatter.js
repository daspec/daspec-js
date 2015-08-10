/*global module, require*/
module.exports = function CountingResultListener(runner) {
	'use strict';
	var self = this,
		AssertionCounts = require('./assertion-counts');

	self.current = new AssertionCounts();
	self.total = new AssertionCounts();

	runner.addEventListener('stepResult', function (result) {
		self.current.recordException(result.exception);
		result.assertions.forEach(function (assertion) {
			self.current.increment(assertion);
		});
	});

	runner.addEventListener('skippedLine', function () {
		self.current.skipped++;
	});
	runner.addEventListener('specStarted', function () {
		self.current = new AssertionCounts();
	});
	runner.addEventListener('specEnded', function () {
		self.total.incrementCounts(self.current);
	});
};
