/*global describe, it, expect, require, beforeEach */
describe('toEqualsSet', function () {
	'use strict';
	var underTest,
		Expect = require('../src/expect'),
		listMatcher = require('../src/matchers/list');
	beforeEach(function () {
		underTest = new Expect([1, 2, 3], listMatcher);
	});
	it('should pass if items are same irrespective of order', function () {
		expect(underTest.toEqualSet([2, 3, 1]).assertions).toEqual([
			{
				actual: {
					matches: true,
					additional: [],
					missing: [],
					matching: [2, 3, 1]
				},
				expected: [2, 3, 1],
				passed: true}
			]);
	});
	it('should return failure information', function () {
		expect(underTest.toEqualSet([2, 1, 4]).assertions).toEqual([
			{
				actual: {
					matches: false,
					additional: [3],
					missing: [4],
					matching: [2, 1]
				},
				expected:[2, 1, 4],
				passed: false}
			]);

	});
});
