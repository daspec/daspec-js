/*global describe, expect, it, beforeEach, require */

describe('MarkDownFormatter', function () {
	'use strict';
	var MarkDownFormatter = require('../src/markdown-formatter'),
		underTest;
	beforeEach(function () {
		underTest = new MarkDownFormatter();
	});
	describe('formatPrimitiveResult', function () {
		it('bolds the expected result if passed', function () {
			expect(underTest.formatPrimitiveResult({expected: 3, value: 6, passed:true, index: 5})).toEqual({index:5, value:'**3**'});
		});
		it('crosses out and bolds the expected and bolds actual result if failed', function () {
			expect(underTest.formatPrimitiveResult({expected:3, value:6, passed:false, index: 1})).toEqual({index:1, value:'**~~3~~ [6]**'});
		});
	});
	describe('markResult', function () {
		it('marks a single indexed assertion as failed within a string if there are no unindexed failures', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/, assertions: [{expected: 4, index: 0, passed: false, value: 3}]})).toEqual('The number is **~~4~~ [3]**');
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
