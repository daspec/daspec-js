/*global module, require */
module.exports = function Step(specContext, processFunction) {
	'use strict';
	var self = this,
		ExpectationBuilder = require('./expectation-builder');
	self.assertions = [];
	if (!specContext || !processFunction) {
		throw new Error('invalid intialisation');
	}
	self.execute = function () {
		if (!self.stepArgs) {
			throw new Error('Step args not defined');
		}
		self.assertions = [];
		var expectationBuilder = new ExpectationBuilder(self.stepArgs, specContext.getMatchers());
		specContext.overrideGlobal('expect', expectationBuilder.expect);
		try {
			processFunction.apply({}, self.stepArgs);
			self.assertions = self.assertions.concat(expectationBuilder.getAssertions());
		} catch (e) {
			/* geniuine error, not assertion fail */
			self.exception = e;
		}
		specContext.resetGlobal();
	};
};
