/*global module, require*/

(function () {
	'use strict';
	var MarkDownFormatter = require('./markdown-formatter'),
		ListUtil = require('./list-util'),
		AssertionCounts = require('./assertion-counts'),
		RegexUtil = require('./regex-util'),
		Context = require('./daspec-context'),
		ExampleBlocks = function (inputText) {
			var self = this;
			self.getBlocks = function () {
				var lines = inputText && inputText.split('\n').reverse(),
					current = new ExampleBlock(),
					blocks = [];
				lines.forEach(function (line) {
					current.addLine(line);
					if (current.isComplete()) {
						blocks.push(current);
						current = new ExampleBlock();
					}
				});
				if (current.getMatchText()) {
					blocks.push(current);
				}
				return blocks.reverse();
			};
		},
		ExampleBlock = function () {
			var self = this,
				regexUtil = new RegexUtil(),
				lines = [];
			self.addLine = function (lineText) {
				lines.unshift(lineText);
			};
			self.isComplete = function () {
				if (lines.length === 0) {
					return false;
				}
				if (regexUtil.isListItem(lines[0])) {
					return false;
				}
				return true;
			};
			self.getList = function () {
				if (lines.length === 0) {
					return false;
				}
				var topLine = lines[0];
				if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
					return {ordered: false, items: lines.filter(regexUtil.isListItem).map(regexUtil.stripListSymbol)};
				}
				return false;
			};
			self.getMatchText = function () {
				if (lines.length === 0) {
					return false;
				}
				var topLine = lines[0];
				if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
					return [topLine];
				} else {
					return lines;
				}
			};
		},
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
