/*global module, require*/
module.exports = function (stepFunc) {
	'use strict';
	var Context = require('./daspec-context'),
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		ExampleBlocks = require('./example-blocks'),
		context = new Context(),
		self = this;
	stepFunc(context);

	self.example = function (inputText) {
		var MarkDownResultFormatter = require('./markdown-result-formatter'),
			results = new MarkDownResultFormatter(),
			blocks = new ExampleBlocks(inputText),
			processTableBlock = function (block) {
				var blockLines = block.getMatchText(),
					step,
					headerLine;
				blockLines.forEach(function (line) {
					if (!regexUtil.isTableDataRow(line)) { //Move to block?
						if (!regexUtil.isTableHeaderDivider(line)) {
							step = false;
						}
						results.nonAssertionLine(line);
						return;
					}

					if (!step) {
						step = context.getStepForLine(line);
						headerLine = line;
						if (!step) {
							results.skippedLine(line);
						} else {
							results.nonAssertionLine(line);
						}
					} else {
						results.stepResult(step.executeTableRow(line, headerLine));
					}
				});
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
