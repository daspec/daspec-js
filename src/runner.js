/*global module, require*/
module.exports = function Runner(stepFunc, config) {
	'use strict';
	var Context = require('./context'),
		CountingResultListener = require('./counting-result-listener'),
		RegexUtil = require('./regex-util'),
		observable = require('./observable'),
		regexUtil = new RegexUtil(),
		ExampleBlocks = require('./example-blocks'),
		self = observable(this);

	self.executeSuite = function (suite) {
		var counts = new CountingResultListener(self),
			executeSpecs = true;

		suite.forEach(function (spec) {
			if (!executeSpecs) {
				return;
			}
			if (typeof spec.content === 'function') {
				self.execute(spec.content(), spec.name);
			} else {
				self.execute(spec.content, spec.name);
			}
			if (config && config.failFast) {
				if (counts.current.error ||  counts.current.failed || (!config.allowSkipped && counts.current.skipped) || !counts.current.passed) {
					executeSpecs = false;
				}
			}
		});
		self.dispatchEvent('suiteEnded', counts.total);
		if (counts.total.failed || counts.total.error || (!config.allowSkipped && counts.total.skipped) || !counts.current.passed) {
			return false;
		}
		return true;
	};
	self.execute = function (inputText, exampleName) {
		var context = new Context(),
			blocks = new ExampleBlocks(inputText),
			lineNumber = 0,
			counts = new CountingResultListener(self),
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
		self.dispatchEvent('specEnded', exampleName, counts.current);
	};
};
