/*global module, require*/
module.exports = function (inputText) {
	'use strict';
	var self = this,
		ExampleBlock = require('./example-block');
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
};
