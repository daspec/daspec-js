/*global module, require*/
module.exports = function Runner(stepFunc, resultFormatter) {
	'use strict';
	var Context = require('./context'),
		RegexUtil = require('./regex-util'),
		observable = require('./observable'),
		regexUtil = new RegexUtil(),
		ExampleBlocks = require('./example-blocks'),
		self = observable(this);

	self.example = function (inputText, exampleName) {
		var context = new Context(),
			blocks = new ExampleBlocks(inputText),
			lineNumber = 0,
			sendLineEvent = function (eventName, line) {
				if (!line) {
					self.dispatchEvent(eventName, lineNumber, exampleName);
				} else {
					self.dispatchEvent(eventName, line, lineNumber, exampleName);
				}
			},
			processTableBlock = function (block) {
				var blockLines = block.getMatchText(),
					step,
					headerLine,
					tableResultBlock,
					startNewTable = function (line) {
						step = context.getStepForLine(line);
						if (!step) {
							resultFormatter.skippedLine(line);
							sendLineEvent('skippedLine', line);
						} else {
							headerLine = line;
							tableResultBlock = resultFormatter.tableResultBlock();
							sendLineEvent('tableStarted');
							sendLineEvent('nonAssertionLine', line);
							tableResultBlock.nonAssertionLine(line);

						}
					},
					endCurrentTable = function () {
						step = false;
						if (tableResultBlock) {
							resultFormatter.appendResultBlock(tableResultBlock);
							sendLineEvent('tableEnded');
							tableResultBlock = false;
						}
					};
				blockLines.forEach(function (line) {
					lineNumber++;
					if (!regexUtil.isTableItem(line)) {
						endCurrentTable();
						resultFormatter.nonAssertionLine(line);
						sendLineEvent('nonAssertionLine', line);
					} else if (!tableResultBlock) {
						startNewTable(line);
					} else if (regexUtil.isTableDataRow(line)) {
						tableResultBlock.stepResult(step.executeTableRow(line, headerLine));
						sendLineEvent('stepResult', step.executeTableRow(line, headerLine));
					} else {
						tableResultBlock.nonAssertionLine(line);
						sendLineEvent('nonAssertionLine', line);
					}
				});
				endCurrentTable();
			},
			processBlock = function (block) {
				var blockLines = block.getMatchText(),
					blockParam = block.getAttachment();
				blockLines.forEach(function (line) {
					lineNumber++;
					if (!regexUtil.assertionLine(line)) { //Move to block?
						resultFormatter.nonAssertionLine(line);
						sendLineEvent('nonAssertionLine', line);
						return;
					}

					var step = context.getStepForLine(line);
					if (!step) {
						resultFormatter.skippedLine(line);
						sendLineEvent('skippedLine', line);
						return;
					}
					resultFormatter.stepResult(step.execute(line, blockParam));
					sendLineEvent('stepResult', step.execute(line, blockParam));
				});
			};
		stepFunc.apply(context, [context]);
		self.dispatchEvent('specStarted', exampleName);
		resultFormatter.exampleStarted(exampleName);
		blocks.getBlocks().forEach(function (block) {
			if (block.isTableBlock()) {
				processTableBlock(block);
			} else {
				processBlock(block);
			}
		});
		resultFormatter.exampleFinished(exampleName);
		self.dispatchEvent('specEnded', exampleName);
	};
};
