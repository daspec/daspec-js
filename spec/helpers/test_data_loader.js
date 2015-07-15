/*global require, global, console */
global.DaSpec = require('../../src/daspec');

global.DaSpecHelper = function () {
	'use strict';
	var fs = require('fs');

	this.loadExample = function (fileName) {
		fileName = fileName && fileName.replace(/.md$/, '');
		var data = fs.readFileSync('test-data/' + fileName + '.md', 'utf-8'),
				match = data.match(/([\s\S]*)<!--OUTPUT([\s\S]*)-->[\s\S]*<!--COUNTS([\s\S]*)-->/),
				input = match && match[1].trim(),
				output = match && match[2].trim(),
				countText = match && match[3].trim(),
				counts,
				inputLines = input && input.split('\n'),
				title = (inputLines && inputLines.length > 0 && inputLines[0].substring(1)) || fileName;
		try {
			counts = countText && JSON.parse(countText);
		} catch (e) {
			console.log('unable to parse JSONin file', fileName, 'countText', countText);
		}

		return match && {
			title: title,
			input: input,
			output: output,
			counts: counts
		};
	};
	this.getExamples = function (folderName) {
		folderName = folderName || 'test-data/';
		return fs.readdirSync('./' + folderName);
	};
};


