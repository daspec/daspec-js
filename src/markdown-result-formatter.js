/*global module, require*/
module.exports = function MarkdownResultFormatter(runner, globalConfig) {
	'use strict';
	var self = this,
		MarkDownFormatter = require('./markdown-formatter'),
		markDownFormatter = new MarkDownFormatter(),
		resultBuffer = [],
		ResultCountListener = require('./counting-result-listener'),
		resultCountListener = new ResultCountListener(runner),
		tableRows = false,
		TableUtil = require('./table-util'),
		tableUtil = new TableUtil(),
		config = (globalConfig && globalConfig.markdown) || {},
		allowSkipped = globalConfig && globalConfig.allowSkipped,
		skippedLineIndicator = config.skippedLineIndicator || '`skipped`',
		skippedPrepend =  allowSkipped ? '' : skippedLineIndicator + ' ',
		countDescription = function () {
			var labels = ['executed', 'passed', 'failed', 'error', 'skipped'],
				description = '> **In da spec:** ',
				comma = false;

			labels.forEach(function (label) {
				if (resultCountListener.current[label]) {
					if (comma) {
						description = description + ', ';
					} else {
						comma = true;
					}
					description = description + label + ': ' + resultCountListener.current[label];
				}
			});
			if (!comma) {
				description = description + 'Nada';
			}
			return description;
		};
	runner.addEventListener('stepResult', function (result) {
		(tableRows || resultBuffer).push(markDownFormatter.markResult(result));
	});
	runner.addEventListener('nonAssertionLine',  function (line) {
		(tableRows || resultBuffer).push(line);
	});
	runner.addEventListener('skippedLine', function (line) {
		resultBuffer.push(skippedPrepend +  line);
	});
	runner.addEventListener('tableStarted', function () {
		tableRows = [];
	});
	runner.addEventListener('tableEnded', function () {
		if (tableRows) {
			resultBuffer = resultBuffer.concat(tableUtil.justifyTable(tableRows));
		}
		tableRows = false;
	});
	runner.addEventListener('specStarted', function () {
		resultBuffer = [];
	});
	runner.addEventListener('specEnded', function () {
		resultBuffer.unshift('');
		resultBuffer.unshift(countDescription());
	});

	self.formattedResults = function () {
		return resultBuffer.join('\n');
	};

};
