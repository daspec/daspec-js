/*global module, require*/

(function () {
	'use strict';
	var MarkDownFormatter = require('./markdown-formatter'),
		ListUtil = require('./list-util'),
		AssertionCounts = require('./assertion-counts'),
		RegexUtil = require('./regex-util'),
		Context = require('./daspec-context'),
		ExampleBlocks = require('./example-blocks'),
		ExampleBlock =  require('./example-block'),
		Runner = function (stepFunc) {
			var context = new Context(),
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
					var blockLines = block.getMatchText(),
						blockList = block.getList();
					if (blockLines) {

						if (blockList) {
							context.executeListStep(blockLines[0], blockList, counts, resultBuffer);
						} else {
							blockLines.forEach(function (line) {
								context.executeStep(line, counts, resultBuffer);
							});
						}
					}
				});
				resultBuffer.unshift('');
				resultBuffer.unshift(countDescription(counts));
				return resultBuffer.join('\n');
			};
		};
	module.exports = {
		Runner: Runner,
		RegexUtil: RegexUtil,
		ExampleBlock: ExampleBlock,
		MarkDownFormatter: MarkDownFormatter,
		ListUtil: ListUtil
	};
})();
