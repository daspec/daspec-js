/*global describe, expect, it, DaSpecHelper  */

describe('data loader', function () {
	'use strict';
	it('extracts inputs, outputs and title from markdown file', function () {
		var example = new DaSpecHelper().loadExample('simple_arithmetic');
		expect(example.input).toEqual('#processes a simple file\n\nSimple arithmetic: 2 plus 2 is 5');
		expect(example.output).toEqual('> **In da spec:** executed: 1, failed: 1\n\n#processes a simple file\n\nSimple arithmetic: 2 plus 2 is **~~5~~ [4]**');
		expect(example.title).toEqual('processes a simple file');
	});
	it('strips file extension from markdown file', function () {
		var example = new DaSpecHelper().loadExample('simple_arithmetic.md');
		expect(example.title).toEqual('processes a simple file');
	});
	it('returns all the examples if a folder', function () {
		var examples = new DaSpecHelper().getExamples();
		expect(examples.length).toBeGreaterThan(0);
	});
});
