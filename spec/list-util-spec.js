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
	});
});
