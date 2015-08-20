/*global module, require*/
module.exports = function ExampleBlocks(inputText) {
	'use strict';
	var self = this,
		ExampleBlock = require('./example-block');
	self.getBlocks = function () {
		var lines = inputText && inputText.split('\n').reverse(),
			current = new ExampleBlock(),
			blocks = [current];
		lines.forEach(function (line) {
			if (!current.canAddLine(line)) {
				current = new ExampleBlock();
				blocks.push(current);
			}
			current.addLine(line);
		});
		return blocks.reverse();
	};
};
