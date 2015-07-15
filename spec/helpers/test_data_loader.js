/*global beforeAll, require, global */
beforeAll(function () {
	'use strict';
	var fs = require('fs');
	global.DaSpec = require('../../src/daspec');

	this.loadExample = function (fileName) {
		var data = fs.readFileSync('test-data/' + fileName + '.md', 'utf-8'),
				match = data.match(/([\s\S]*)<!--([\s\S]*)-->/),
				input = match && match[1].trim(),
				inputLines = input && input.split('\n'),
				title = (inputLines && inputLines.length > 0 && inputLines[0].substring(1)) || fileName;
		return match && {
			title: title,
			input: input,
			output: match[2].trim()
		};
	};
});


