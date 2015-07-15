/*global require, global */
global.DaSpec = require('../../src/daspec');

global.DaSpecHelper = function () {
	'use strict';
	var fs = require('fs');

	this.loadExample = function (fileName) {
		fileName = fileName && fileName.replace(/.md$/, '');
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
	this.getExamples = function (folderName) {
		folderName = folderName || 'test-data/';
		return fs.readdirSync('./' + folderName);
	};
};


