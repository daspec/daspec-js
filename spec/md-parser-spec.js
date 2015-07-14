/*global describe, expect, it, DaSpec, beforeEach  */

describe('hello from node jasmine', function () {
	'use strict';
	var stepDefinitions;
	beforeEach(function () {
		stepDefinitions = function (ctx) {
			ctx.defineStep(/Simple arithmetic: (\d*) plus (\d*) is (\d*)/, function (firstArg, secondArg, expectedResult) {
				ctx.assertEquals(expectedResult, parseFloat(firstArg) + parseFloat(secondArg), 2);
			});
			ctx.defineStep(/Simple arithmetic: (\d*) and (\d*) added is (\d*) and multiplied is (\d*)/, function (firstArg, secondArg, expectedAdd, expectedMultiply) {
				ctx.assertEquals(expectedAdd, parseFloat(firstArg) + parseFloat(secondArg), 2);
				ctx.assertEquals(expectedMultiply, parseFloat(firstArg) * parseFloat(secondArg), 3);
			});
			ctx.defineStep(/Multiple Assertions (\d*) is (\d*) and (.*)/, function (num1, num2, lineStatus) {
				ctx.assertEquals(num2, num1, 1);
				ctx.assertEquals(lineStatus, 'passes');
			});
			ctx.defineStep(/Multiple Assertions line ([a-z]*) and ([a-z]*)/, function (lineStatus1, lineStatus2) {
				ctx.assertEquals(lineStatus1, 'passes');
				ctx.assertEquals(lineStatus2, 'passes');
			});
		};
	});

	it('links', function () {
		expect('hello' + ' world').toEqual('hello world');
	});
	it('loads a file', function () {
		var example = this.loadExample('simple_arithmetic');
		expect(example.input).toEqual('Simple arithmetic: 2 plus 2 is 5');
		expect(example.output).toEqual('Simple arithmetic: 2 plus 2 is **~~5~~ [4]**');
	});
	/***/
	it('processes a simple file', function () {
		var runner = new DaSpec.Runner(stepDefinitions),
			example = this.loadExample('simple_arithmetic'),
			result = runner.example(example.input);
		expect(result.counts).toEqual({executed: 1, failed: 1, skipped: 0, passed: 0, error: 0});
		expect(result.output).toEqual(example.output);
	});
	it('marks successful checks', function () {
		var runner = new DaSpec.Runner(stepDefinitions),
			example = this.loadExample('simple_arithmetic_success'),
			result = runner.example(example.input);
		expect(result.counts).toEqual({executed: 1, failed: 0, skipped: 0, passed: 1, error: 0});
		expect(result.output).toEqual(example.output);
	});
	it('marks multiple assertions on the same line', function () {
		var runner = new DaSpec.Runner(stepDefinitions),
			example = this.loadExample('simple_arithmetic_multi_assertion'),
			result = runner.example(example.input);
		expect(result.counts).toEqual({executed: 2, failed: 0, skipped: 0, passed: 2, error: 0});
		expect(result.output).toEqual(example.output);
	});
	it('works with multiple-line source files', function () {
		var runner = new DaSpec.Runner(stepDefinitions),
			example = this.loadExample('simple_arithmetic_multiline'),
			result = runner.example(example.input);
		expect(result.counts).toEqual({executed: 2, failed: 1, skipped: 0, passed: 1, error: 0});
		expect(result.output).toEqual(example.output);
	});
	it('marks up lines with multiple/passes failures', function () {
		var runner = new DaSpec.Runner(stepDefinitions),
			example = this.loadExample('line_marking'),
			result = runner.example(example.input);
		expect(result.counts).toEqual({executed: 14, failed: 7, skipped: 0, passed: 7, error: 0});
		expect(result.output).toEqual(example.output);
	});

});
