/*global module, require, Promise */
module.exports = function Step(specContext, processFunction) {
	'use strict';
	var self = this,
		ExpectationBuilder = require('./expectation-builder'),
		makePromise = function (expect) {
			return new Promise(function (resolve, reject) {
				specContext.overrideGlobal('expect', expect);
				try {
					processFunction.apply({}, self.stepArgs);
					resolve();
				} catch (e) {
					reject(e);
				}
				specContext.resetGlobal();
			});
		};
	self.assertions = [];
	if (!specContext || !processFunction) {
		throw new Error('invalid intialisation');
	}

	self.execute = function () {
		var expectationBuilder;
		if (!self.stepArgs) {
			throw new Error('Step args not defined');
		}
		self.assertions = [];
		expectationBuilder = new ExpectationBuilder(self.stepArgs, specContext.getMatchers());

		return new Promise(function (resolve) {
			makePromise(expectationBuilder.expect).then(function () {
				self.assertions = self.assertions.concat(expectationBuilder.getAssertions());
				resolve(self);
			},	function (e) {
				self.exception = e;
				resolve(self);
			});
		});

	};
};
