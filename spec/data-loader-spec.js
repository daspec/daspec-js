/*global describe, expect, it  */

describe('data loader', function () {
	'use strict';
	it('extracts inputs, outputs and title from markdoen file', function () {
		var example = this.loadExample('simple_arithmetic');
		expect(example.input).toEqual('#processes a simple file\nSimple arithmetic: 2 plus 2 is 5');
		expect(example.output).toEqual('#processes a simple file\nSimple arithmetic: 2 plus 2 is **~~5~~ [4]**');
		expect(example.title).toEqual('processes a simple file');
	});
});
