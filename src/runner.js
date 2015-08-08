/*global module, require*/
module.exports = function Runner(stepFunc, resultFormatter) {
	'use strict';
	var Context = require('./context'),
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		ExampleBlocks = require('./example-blocks'),
		self = this;


	self.example = function (inputText) {
		var context = new Context(),
			blocks = new ExampleBlocks(inputText),
			processTableBlock = function (block) {
				var blockLines = block.getMatchText(),
					step,
					headerLine,
					tableResultBlock,
					startNewTable = function (line) {
						step = context.getStepForLine(line);
						if (!step) {
							resultFormatter.skippedLine(line);
						} else {
							headerLine = line;
							tableResultBlock = resultFormatter.tableResultBlock();
							tableResultBlock.nonAssertionLine(line);
						}
					},
					endCurrentTable = function () {
						step = false;
						if (tableResultBlock) {
							resultFormatter.appendResultBlock(tableResultBlock);
							tableResultBlock = false;
						}
					};
				blockLines.forEach(function (line) {
					if (!regexUtil.isTableItem(line)) {
						endCurrentTable();
						resultFormatter.nonAssertionLine(line);
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
						resultFormatter.nonAssertionLine(line);
						return;
					}

					var step = context.getStepForLine(line);
					if (!step) {
						resultFormatter.skippedLine(line);
						return;
					}
					resultFormatter.stepResult(step.execute(line, blockParam));
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
	};
};
