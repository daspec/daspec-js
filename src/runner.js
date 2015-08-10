/*global module, require*/
module.exports = function Runner(stepFunc) {
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
				if (!line && line !== '') {
					self.dispatchEvent(eventName, lineNumber, exampleName);
				} else {
					self.dispatchEvent(eventName, line, lineNumber, exampleName);
				}
			},
			processTableBlock = function (block) {
				var blockLines = block.getMatchText(),
					step,
					headerLine,
					// tableResultBlock,
					startNewTable = function (line) {
						step = context.getStepForLine(line);
						if (!step) {
							sendLineEvent('skippedLine', line);
						} else {
							headerLine = line;
							sendLineEvent('tableStarted');
							sendLineEvent('nonAssertionLine', line);

						}
					},
					endCurrentTable = function () {
						if (step) {
							sendLineEvent('tableEnded');
							step = false;
						}
					};
				blockLines.forEach(function (line) {
					lineNumber++;
					if (!regexUtil.isTableItem(line)) {
						endCurrentTable();
						sendLineEvent('nonAssertionLine', line);
					} else if (!step) {
						startNewTable(line);
					} else if (regexUtil.isTableDataRow(line)) {
						sendLineEvent('stepResult', step.executeTableRow(line, headerLine));
					} else {
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
						sendLineEvent('nonAssertionLine', line);
						return;
					}

					var step = context.getStepForLine(line);
					if (!step) {
						sendLineEvent('skippedLine', line);
						return;
					}
					sendLineEvent('stepResult', step.execute(line, blockParam));
				});
			};
		stepFunc.apply(context, [context]);
		self.dispatchEvent('specStarted', exampleName);
		blocks.getBlocks().forEach(function (block) {
			if (block.isTableBlock()) {
				processTableBlock(block);
			} else {
				processBlock(block);
			}
		});
		self.dispatchEvent('specEnded', exampleName);
	};
};
