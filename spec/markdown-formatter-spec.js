/*global describe, expect, it, beforeEach, DaSpec */

describe('MarkDownFormatter', function () {
	'use strict';
	var underTest;
	beforeEach(function () {
		underTest = new DaSpec.MarkDownFormatter();
	});
	describe('formatPrimitiveResult', function () {
		it('bolds the expected result if passed', function () {
			expect(underTest.formatPrimitiveResult(3, 6, true)).toEqual('**3**');
		});
		it('crosses out and bolds the expected and bolds actual result if failed', function () {
			expect(underTest.formatPrimitiveResult(3, 6, false)).toEqual('**~~3~~ [6]**');
		});
	});
	describe('formatListResult', function () {
		var dash = String.fromCharCode(8211),
				tick = String.fromCharCode(10003);
		it('ticks all matching lines, then reports missing followed by additional lines', function () {
			expect(underTest.formatListResult({matching: ['a', 'b', 'c'], missing: ['d', 'e'], additional: ['f', 'g']})).toEqual(
				[
					'[' + tick + '] a',
					'[' + tick + '] b',
					'[' + tick + '] c',
					'**[' + dash + '] ~~d~~**',
					'**[' + dash  + '] ~~e~~**',
					'**[+] f**',
					'**[+] g**'
				]);
		});
	});

});
