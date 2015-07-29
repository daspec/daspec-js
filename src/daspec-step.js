/*global module, require*/
module.exports = function (regexMatcher, processFunction) {
	'use strict';
	var self = this,
			StepContext = require('./step-context');
	self.match = function (stepText) {
		return regexMatcher.test(stepText);
	};
	self.execute = function (stepText, attachment) {
		var match = stepText.match(regexMatcher),
			stepArgs = match.slice(1),
			result = {
				matcher: regexMatcher,
				stepText: stepText,
				attachment: attachment,
				assertions: []
			},
			stepContext = new StepContext(result);

		if (attachment) { /* we know it's a list and the symbol */
			stepArgs.push(attachment);
		}

		try {
			processFunction.apply(stepContext, stepArgs);
		} catch (e) {
			/* geniuine error, not assertion fail */
			result.exception = e;
		}


		return result;
	};
};
