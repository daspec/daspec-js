/*global describe, expect, it, beforeEach, require */

describe('ListUtil', function () {
	'use strict';
	var ListUtil = require('../src/list-util'),
		underTest;
	beforeEach(function () {
		underTest = new ListUtil();
	});
	describe('unorderedMatch', function () {
		it('returns matches=true and no additonal/missing if two sets are the same', function () {
			expect(underTest.unorderedMatch([1, 2, 3], [3, 2, 1])).toEqual({
				matches: true,
				matching: [1, 2, 3],
				missing: [],
				additional: []
			});
			expect(underTest.unorderedMatch([1, 2, 3], [1, 2, 3, 2, 1])).toEqual({
				matches: true,
				matching: [1, 2, 3],
				missing: [],
				additional: []
			});
		});
		it('returns matches=false and breaks into matching/missing/additional if the sets are different', function () {
			expect(underTest.unorderedMatch([1, 2, 4, 5, 3], [1, 2, 6, 3, 7])).toEqual({
				matches: false,
				matching: [1, 2, 3],
				missing: [4, 5],
				additional: [6, 7]
			});
		});
		it('works on two-dimensional arrays', function () {
			expect(underTest.unorderedMatch([[1, 2], [3, 4], [5, 6]], [[5, 6], [4, 2], [1, 2]])).toEqual({
				matches: false,
				missing: [[3, 4]],
				additional: [[4, 2]],
				matching: [[1, 2], [5, 6]]
			});
		});
		it('works if first arg is undefined', function () {
			expect(underTest.unorderedMatch(undefined, [[5, 6], [4, 2], [1, 2]])).toEqual({
				matches: false,
				missing: [],
				additional: [[5, 6], [4, 2], [1, 2]],
				matching: []
			});
		});
		it('works if second arg is undefined', function () {
			expect(underTest.unorderedMatch([[5, 6], [4, 2], [1, 2]], undefined)).toEqual({
				matches: false,
				missing: [[5, 6], [4, 2], [1, 2]],
				additional: [],
				matching: []
			});
		});
		it('works if all arguments are undefined', function () {
			expect(underTest.unorderedMatch()).toEqual({
				matches: true,
				missing: [],
				additional: [],
				matching: []
			});
		});
	});
});
