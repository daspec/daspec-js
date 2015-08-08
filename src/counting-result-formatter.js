/*global module, require*/
module.exports = function CountingResultFormatter() {
	'use strict';
	var self = this,
		AssertionCounts = require('./assertion-counts'),
		TableResultBlock = function () {
			var table = this;
			table.nonAssertionLine = function () { };
			table.stepResult = self.stepResult;
		},
		listeners = {
			closed: [],
			exampleFinished: []
		},
		dispatchEvent = function (eventName) {
			var args = Array.prototype.slice.call(arguments, 1);
			listeners[eventName].forEach(function (listener) {
				listener.apply(undefined, args);
			});
		};
	self.addEventListener = function (eventName, processor) {
		listeners[eventName].push(processor);
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
	self.exampleFinished = function (name) {
		self.total.incrementCounts(self.current);
		dispatchEvent('exampleFinished', name, self.current);
	};
	self.exampleStarted = function () {
		self.current = new AssertionCounts();
	};
	self.close = function () {
		dispatchEvent('closed', self.total);
	};
};
