/*global beforeAll, require, global */
beforeAll(function () {
	'use strict';
	var fs = require('fs');
	global.DaSpec = require('../../src/daspec');

	this.loadExample = function (fileName) {
		var data = fs.readFileSync('test-data/' + fileName + '.md', 'utf-8'),
				match = data.match(/([\s\S]*)<!--([\s\S]*)-->/);
		return match && {
			input: match[1].trim(),
			output: match[2].trim()
		};
	};
});


