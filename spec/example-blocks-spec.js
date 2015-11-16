/*global describe, it, expect, require */
describe('ExampleBlocks', function () {
	'use strict';
	var ExampleBlocks = require('../src/example-blocks');
	it('should split lines delimited by LF', function () {
		var blocks = new ExampleBlocks('Line 1\nLine 2\nLine 3').getBlocks();
		expect(blocks.map(function (block) {
			return block.getMatchText();
		})).toEqual([['Line 1'], ['Line 2'], ['Line 3']]);
	});
	it('should split lines delimited by CRLF', function () {
		var blocks = new ExampleBlocks('Line 1\r\nLine 2\r\nLine 3').getBlocks();
		expect(blocks.map(function (block) {
			return block.getMatchText();
		})).toEqual([['Line 1'], ['Line 2'], ['Line 3']]);
	});
});
