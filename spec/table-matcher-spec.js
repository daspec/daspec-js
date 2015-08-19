/*global describe, beforeEach, require, expect, it*/
describe('table matchers', function () {
	'use strict';
	var underTest,
		ExpectationBuilder = require('../src/expectation-builder'),
		tableMatcher = require('../src/matchers/table');
	beforeEach(function () {
		underTest = new ExpectationBuilder([], tableMatcher);
	});
	describe('toEqualUnorderedTable', function () {
		it('compares two tables on row values, returning missing/additional/matching', function () {
			var result = underTest.expect({type: 'table', items: [[4, 2], [1, 2]]}).toEqualUnorderedTable({type: 'table', items: [[1, 2], [3, 4]]});
			expect(result.assertions.length).toBe(1);
			expect(result.assertions[0].passed).toBe(false);
			expect(result.assertions[0].actual).toEqual({matches: false, missing: [[3, 4]], additional: [[4, 2]], matching: [[1, 2]]});
		});
		it('uses table column titles to match rows, if titles are provided', function () {
			var result = underTest.expect({type: 'table', titles: ['benefit', 'Cost'], items: [[2, 4], [2, 1]]}).toEqualUnorderedTable({type: 'table', titles: ['cost', 'benefit'], items: [[1, 2], [3, 4]]});
			expect(result.assertions.length).toBe(1);
			expect(result.assertions[0].passed).toBe(false);
			expect(result.assertions[0].actual).toEqual({matches: false, missing: [[3, 4]], additional: [[4, 2]], matching: [[1, 2]]});
		});
		it('uses table column titles to match key-value domain objects, if titles are provided', function () {
			var result = underTest.expect([{benefit:2, cost:4}, {benefit:2, cost:1, extra: 3}, { benefit: 4}]).toEqualUnorderedTable({type: 'table', titles: ['cost', 'benefit'], items: [[1, 2], [3, 4]]});
			expect(result.assertions.length).toBe(1);
			expect(result.assertions[0].passed).toBe(false);
			expect(result.assertions[0].actual).toEqual({matches: false, missing: [[3, 4]], additional: [[4, 2], [undefined, 4]], matching: [[1, 2]]});
		});

	});
});
