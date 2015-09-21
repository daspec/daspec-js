/*global module, require, Promise*/
module.exports = function Runner(stepFunc, config) {
	'use strict';
	var Context = require('./context'),
		CountingResultListener = require('./counting-result-listener'),
		RegexUtil = require('./regex-util'),
		StepExecutor = require('./step-executor'),
		PromisingIterator = require('./promising-iterator'),
		observable = require('./observable'),
		regexUtil = new RegexUtil(),
		ExampleBlocks = require('./example-blocks'),
		self = observable(this),
		standardMatchers = [require('./matchers/table'), require('./matchers/list')],
		context = new Context();
	self.executeSuite = function (suite) {
		var counts = new CountingResultListener(self),
			executeSpecs = true,
			iterator = new PromisingIterator(suite, function (spec) {
				var specPromise;
				if (!executeSpecs) {
					return;
				}
				if (typeof spec.content === 'function') {
					specPromise = self.execute(spec.content(), spec.name);
				} else {
					specPromise = self.execute(spec.content, spec.name);
				}
				specPromise.then(function () {
					if (config && config.failFast) {
						if (counts.current.error ||  counts.current.failed || (!config.allowSkipped && counts.current.skipped) || !counts.current.passed) {
							executeSpecs = false;
						}
					}
				});
				return specPromise;
			});
		return new Promise(function (resolve, reject) {
			iterator.iterate().then(function () {
				self.dispatchEvent('suiteEnded', counts.total);
				if (counts.total.failed || counts.total.error || (!config.allowSkipped && counts.total.skipped) || !counts.current.passed) {
					return resolve(false);
				}
				resolve(true);
			}, reject);
		});
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
				return new PromisingIterator(blockLines, function (line) {
					lineNumber++;
					if (!regexUtil.isTableItem(line)) {
						endCurrentTable();
						sendLineEvent('nonAssertionLine', line);
					} else if (!stepDefinition) {
						startNewTable(line);
					} else if (regexUtil.isTableDataRow(line)) {
						executor = new StepExecutor(stepDefinition, context);
						return executor.executeTableRow(line, headerLine).then(function (result) {
							sendLineEvent('stepResult', result);
						});
					} else {
						sendLineEvent('nonAssertionLine', line);
					}
				}).iterate().then(endCurrentTable);
			},
			processBlock = function (block) {
				var blockLines = block.getMatchText(),
					blockParam = block.getAttachment(),
					attachmentLines = block.getAttachmentLines(),
					executor;

				return new PromisingIterator(blockLines, function (line) {
					var stepDefinition;
					lineNumber++;
					if (!regexUtil.assertionLine(line)) { //Move to block?
						if (!blockParam) {
							sendLineEvent('nonAssertionLine', line);
						}
						return;
					}
					stepDefinition = context.getStepDefinitionForLine(line);
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
					return executor.execute(line, blockParam).then(function (result) {
						sendLineEvent('stepResult', result);
						lineNumber += attachmentLines.length;
					});
				}).iterate();
			};
		self.dispatchEvent('specStarted', exampleName);
		return new PromisingIterator(blocks.getBlocks(), function (block) {
			if (block.isTableBlock()) {
				return processTableBlock(block);
			} else {
				return processBlock(block);
			}
		}).iterate().then(function () {
			self.dispatchEvent('specEnded', exampleName, counts.current);
		});
	};
	context.exportToGlobal();
	standardMatchers.concat((config && config.matchers) || []).forEach(context.addMatchers);
	stepFunc.apply(context, [context]);
	context.resetGlobal();
};
