/*global module, require, Promise */
module.exports = function Step(specContext, processFunction) {
	'use strict';
	var self = this,
		ExpectationBuilder = require('./expectation-builder'),
		makePromise = function (expect) {
			return new Promise(function (resolve, reject) {
				var execResult;
				specContext.overrideGlobal('expect', expect);
				try {
					execResult = processFunction.apply({}, self.stepArgs);
					if (execResult && execResult.then) {
						execResult.then(function () {
							specContext.resetGlobal();
							resolve();
						}, function (reason) {
							specContext.resetGlobal();
							reject(reason);
						});
					} else {
						specContext.resetGlobal();
						resolve();
					}
				} catch (e) {
					specContext.resetGlobal();
					reject(e);
				}
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
