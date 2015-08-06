/*global module, require*/
module.exports = function Runner(stepFunc) {
	'use strict';
	var Context = require('./context'),
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		ExampleBlocks = require('./example-blocks'),
		self = this;


	self.example = function (inputText) {
		var MarkDownResultFormatter = require('./markdown-result-formatter'),
			context = new Context(),
			results = new MarkDownResultFormatter(),
			blocks = new ExampleBlocks(inputText),
			processTableBlock = function (block) {
				var blockLines = block.getMatchText(),
					step,
					headerLine,
					tableResultBlock,
					startNewTable = function (line) {
						step = context.getStepForLine(line);
						if (!step) {
							results.skippedLine(line);
						} else {
							headerLine = line;
							tableResultBlock = results.tableResultBlock();
							tableResultBlock.nonAssertionLine(line);
						}
					},
					endCurrentTable = function () {
						step = false;
						if (tableResultBlock) {
							results.appendResultBlock(tableResultBlock);
							tableResultBlock = false;
						}
					};
				blockLines.forEach(function (line) {
					if (!regexUtil.isTableItem(line)) {
						endCurrentTable();
						results.nonAssertionLine(line);
					} else if (!tableResultBlock) {
						startNewTable(line);
					} else if (regexUtil.isTableDataRow(line)) {
						tableResultBlock.stepResult(step.executeTableRow(line, headerLine));
					} else {
						tableResultBlock.nonAssertionLine(line);
					}
				});
				endCurrentTable();
			},
			processBlock = function (block) {
				var blockLines = block.getMatchText(),
					blockParam = block.getAttachment();
				blockLines.forEach(function (line) {
					if (!regexUtil.assertionLine(line)) { //Move to block?
						results.nonAssertionLine(line);
						return;
					}

					var step = context.getStepForLine(line);
					if (!step) {
						results.skippedLine(line);
						return;
					}
					results.stepResult(step.execute(line, blockParam));
				});
			};
		stepFunc.apply(context, [context]);
		blocks.getBlocks().forEach(function (block) {
			if (block.isTableBlock()) {
				processTableBlock(block);
			} else {
				processBlock(block);
			}
		});
		return results.formattedResults();
	};
};
