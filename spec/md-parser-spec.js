/*global describe, expect, it, DaSpec, beforeEach  */

describe('hello from node jasmine', function () {
	'use strict';
	var stepDefinitions;
	beforeEach(function () {
		stepDefinitions = function (ctx) {
			ctx.defineStep(/Simple arithmetic: (\d*) plus (\d*) is (\d*)/, function (firstArg, secondArg, expectedResult) {
				ctx.assertEquals(expectedResult, parseFloat(firstArg) + parseFloat(secondArg), 2);
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
		expect(result.counts).toEqual({executed: 1, failed: 1, skipped: 0, passed: 0});
		expect(result.output).toEqual(example.output);
	});
	it('marks successful checks', function () {
		var runner = new DaSpec.Runner(stepDefinitions),
			example = this.loadExample('simple_arithmetic_success'),
			result = runner.example(example.input);
		expect(result.counts).toEqual({executed: 1, failed: 0, skipped: 0, passed: 1});
		expect(result.output).toEqual(example.output);
	});

});
