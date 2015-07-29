/* global describe, it, expect, beforeEach, require */
describe('StepContext', function () {
	'use strict';
	var StepContext = require('../src/step-context'),
			underTest, result;
	beforeEach(function () {
		result = { assertions: [] };
		underTest = new StepContext(result);
	});
	describe('assertSetEquals', function () {
		it('compares two arrays with an unordered match', function () {
			underTest.assertSetEquals([1, 2, 3], [4, 2]);
			expect(result.assertions.length).toBe(1);
			expect(result.assertions[0].passed).toBe(false);
			expect(result.assertions[0].value).toEqual({matches: false, missing: [1, 3], additional: [4], matching: [2]});
		});
		it('compares two-dimensional arrays with an unordered match', function () {
			underTest.assertSetEquals([[1, 2], [3, 4]], [[4, 2], [1, 2]]);
			expect(result.assertions.length).toBe(1);
			expect(result.assertions[0].passed).toBe(false);
			expect(result.assertions[0].value).toEqual({matches: false, missing: [[3, 4]], additional: [[4, 2]], matching: [[1, 2]]});
		});
	});
	describe('assertUnorderedTableEquals', function () {

		it('compares two tables on row values, returning missing/additional/matching', function () {
			underTest.assertUnorderedTableEquals({type: 'table', items: [[1, 2], [3, 4]]}, {type: 'table', items: [[4, 2], [1, 2]]});
			expect(result.assertions.length).toBe(1);
			expect(result.assertions[0].passed).toBe(false);
			expect(result.assertions[0].value).toEqual({matches: false, missing: [[3, 4]], additional: [[4, 2]], matching: [[1, 2]]});
		});
		//TODO: normalised title comparison
		it('uses table column titles to match rows, if titles are provided', function () {
			underTest.assertUnorderedTableEquals({type: 'table', titles: ['cost', 'benefit'], items: [[1, 2], [3, 4]]},
				{type: 'table', titles: ['benefit', 'Cost'], items: [[2, 4], [2, 1]]});
			expect(result.assertions.length).toBe(1);
			expect(result.assertions[0].passed).toBe(false);
			expect(result.assertions[0].value).toEqual({matches: false, missing: [[3, 4]], additional: [[4, 2]], matching: [[1, 2]]});
		});
		it('uses table column titles to match key-value domain objects, if titles are provided', function () {
			underTest.assertUnorderedTableEquals({type: 'table', titles: ['cost', 'benefit'], items: [[1, 2], [3, 4]]},
				[{benefit:2, cost:4}, {benefit:2, cost:1, extra: 3}, { benefit: 4}]);
			expect(result.assertions.length).toBe(1);
			expect(result.assertions[0].passed).toBe(false);
			expect(result.assertions[0].value).toEqual({matches: false, missing: [[3, 4]], additional: [[4, 2], [undefined, 4]], matching: [[1, 2]]});
		});


	});
});
