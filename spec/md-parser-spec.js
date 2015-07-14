/*global describe, expect, it, DaSpec  */

describe('regex util', function () {
	'use strict';
	describe('replaceMatchGroup', function () {
		it('replaces a substring corresponding to a match group by index', function () {
			expect(new DaSpec.RegexUtil().replaceMatchGroup(
				'Simple arithmetic: 22 plus 222 is 2 and 43',
				/Simple arithmetic: (\d*) plus (\d*) is (\d*) and (\d*)/,
				2,
				'XXX'
				)).toEqual('Simple arithmetic: 22 plus 222 is XXX and 43');
		});
	});
});
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
	it('processes a simple file', function () {
		var runner = new DaSpec.Runner(function (ctx) {
				ctx.defineStep(/Simple arithmetic: (\d*) plus (\d*) is (\d*)/, function (firstArg, secondArg, expectedResult) {
					ctx.assertEquals(expectedResult, parseFloat(firstArg) + parseFloat(secondArg), 2);
				});
			}),
			example = this.loadExample('simple_arithmetic'),
			result = runner.example(example.input);
		expect(result.counts).toEqual({executed: 1, failed: 1, skipped: 0});
		expect(result.output).toEqual(example.output);
	});

});
