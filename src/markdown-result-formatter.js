/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
		MarkDownFormatter = require('./markdown-formatter'),
		markDownFormatter = new MarkDownFormatter(),
		AssertionCounts = require('./assertion-counts'),
		resultBuffer = [],
		counts = new AssertionCounts(),
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
	self.stepResult = function (result) {
		if (result.exception) {
			//geniuine error, not assertion fail
			resultBuffer.push('~~' + result.stepText + '~~'); //TODO: push list as well
			resultBuffer.push('\t' + result.exception.stack);
			counts.recordException(result.exception);
		} else {
			result.assertions.forEach(function (assertion) {
				counts.increment(assertion);
			});
			resultBuffer.push(markDownFormatter.markResult(result.assertions, result.stepText, result, result.list));
		}
	};
	self.nonAssertionLine = function (line) {
		resultBuffer.push(line);
	};
	self.skippedLine = function (line) {
		resultBuffer.push(line);
		counts.skipped++;
	};

	self.formattedResults = function () {
		var out = resultBuffer.slice(0);
		out.unshift('');
		out.unshift(countDescription(counts));
		return out.join('\n');
	};
};
