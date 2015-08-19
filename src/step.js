/*global module, require */
module.exports = function Step(specContext, processFunction) {
	'use strict';
	var self = this,
		ExpectationBuilder = require('./expectation-builder'),
		Assertion = require('./assertion');
	self.assertions = [];
	if (!specContext || !processFunction) {
		throw new Error('invalid intialisation');
	}
	self.execute = function () {
		//TODO: tests
		if (!self.stepArgs) {
			throw new Error('Step args not defined');
		}
		self.assertions = [];
		var expectationBuilder = new ExpectationBuilder(self.stepArgs, specContext.getMatchers());
		specContext.overrideGlobal('expect', expectationBuilder.expect);
		try {
			processFunction.apply({}, self.stepArgs);
			// TODO: remove assertion class, check where value is used and rename to actual (formatters)
			expectationBuilder.getAssertions().forEach(function (a) {
				self.assertions.push(new Assertion(a.expected, a.actual, a.passed, a.position));
			});
		} catch (e) {
			/* geniuine error, not assertion fail */
			self.exception = e;
		}
		specContext.resetGlobal();
	};
};
