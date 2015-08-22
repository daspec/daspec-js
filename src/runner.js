/*global module, require*/
module.exports = function Runner(stepFunc, config) {
	'use strict';
	var Context = require('./context'),
		CountingResultListener = require('./counting-result-listener'),
		RegexUtil = require('./regex-util'),
		StepExecutor = require('./step-executor'),
		observable = require('./observable'),
		regexUtil = new RegexUtil(),
		ExampleBlocks = require('./example-blocks'),
		self = observable(this),
		standardMatchers = [require('./matchers/table'), require('./matchers/list')],
		context = new Context();
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
		var blocks = new ExampleBlocks(inputText),
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
					stepDefinition,
					executor,
					headerLine,
					startNewTable = function (line) {
						stepDefinition = context.getStepDefinitionForLine(line);
						if (!stepDefinition) {
							sendLineEvent('skippedLine', line);
						} else {
							headerLine = line;
							sendLineEvent('tableStarted');
							sendLineEvent('nonAssertionLine', line);
						}
					},
					endCurrentTable = function () {
						if (stepDefinition) {
							sendLineEvent('tableEnded');
							stepDefinition = false;
						}
					};
				blockLines.forEach(function (line) {
					lineNumber++;
					if (!regexUtil.isTableItem(line)) {
						endCurrentTable();
						sendLineEvent('nonAssertionLine', line);
					} else if (!stepDefinition) {
						startNewTable(line);
					} else if (regexUtil.isTableDataRow(line)) {
						executor = new StepExecutor(stepDefinition, context);
						sendLineEvent('stepResult', executor.executeTableRow(line, headerLine));
					} else {
						sendLineEvent('nonAssertionLine', line);
					}
				});
				endCurrentTable();
			},
			processBlock = function (block) {
				var blockLines = block.getMatchText(),
					blockParam = block.getAttachment(),
					attachmentLines = block.getAttachmentLines(),
					executor;
				blockLines.forEach(function (line) {
					lineNumber++;
					if (!regexUtil.assertionLine(line)) { //Move to block?
						if (!blockParam) {
							sendLineEvent('nonAssertionLine', line);
						}
						return;
					}

					var stepDefinition = context.getStepDefinitionForLine(line);
					if (!stepDefinition) {
						sendLineEvent('skippedLine', line);
						if (attachmentLines.length) {
							sendLineEvent('nonAssertionLine', '');
							attachmentLines.forEach(function (attachmentLine) {
								lineNumber++;
								sendLineEvent('nonAssertionLine', attachmentLine);
							});
						}
						return;
					}
					executor = new StepExecutor(stepDefinition, context);
					sendLineEvent('stepResult', executor.execute(line, blockParam));
					lineNumber += attachmentLines.length;
				});
			};
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
	context.exportToGlobal();
	standardMatchers.concat((config && config.matchers) || []).forEach(context.addMatchers);
	stepFunc.apply(context, [context]);
	context.resetGlobal();
};
