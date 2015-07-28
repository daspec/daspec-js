/*global module, require*/
module.exports = function (stepFunc) {
	'use strict';
	var Context = require('./daspec-context'),
		AssertionCounts = require('./assertion-counts'),
		ExampleBlocks = require('./example-blocks'),
		context = new Context(),
		self = this,
		countDescription = function (counts) {
			var labels = ['executed', 'passed', 'failed', 'error', 'skipped'],
				description = '> **In da spec:** ',
				comma = false;

			labels.forEach(function (label) {
				if (counts[label]) {
					if (comma) {
						description = description + ', ';
					} else {
						comma = true;
					}
					description = description + label + ': ' + counts[label];
				}
			});
			if (!comma) {
				description = description + 'Nada';
			}
			return description;
		};
	stepFunc(context);

	self.example = function (inputText) {
		var counts = new AssertionCounts(),
			resultBuffer = [],
			blocks = new ExampleBlocks(inputText);
		blocks.getBlocks().forEach(function (block) {
			var executionResult = context.executeBlock(block);
			counts.incrementCounts(executionResult.counts);
			resultBuffer = resultBuffer.concat(executionResult.resultBuffer);
		});
		resultBuffer.unshift('');
		resultBuffer.unshift(countDescription(counts));
		return resultBuffer.join('\n');
	};
};
