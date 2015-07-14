/*global describe, expect, it, window, xit, DaSpec, beforeAll, require */


describe('hello from node jasmine', function () {
	'use strict';

	it('works', function () {
		expect('hello' + ' world').toEqual('hello world');
	});
	it('loads a file', function () {
		var example = this.loadExample('simple_arithmetic');
		expect(example.input).toEqual('Simple arithmetic: 2 plus 2 is 5');
		expect(example.output).toEqual('Simple arithmetic: 2 plus 2 is **~~5~~ [4]**');
	});
	it('pings', function () {
		expect(DaSpec.ping()).toEqual('pong');
	});
	/***/
	xit('processes a simple file', function () {
		var runner = new DaSpec.Runnner(function (ctx) {
				ctx.defineStep('Simple arithmentic: (\\d)* plus (\\d)* is (\\d)*', function (firstArg, secondArg, expectedResult) {
						ctx.assertEquals(firstArg + secondArg, expectedResult, 2 /* parameter index to check */);
					});
			}),
			example = this.loadExample('simple-arithmetic'),
			result = runner.example(example.input);
		expect(result.output).toEqual(example.output);
		expect(result.counts).toEqual({executed: 1, failed: 1});
	});

});
