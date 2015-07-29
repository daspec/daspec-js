/*global describe, it, expect, require, beforeEach */

describe('TableUtil', function () {
	'use strict';
	var TableUtil = require('../src/table-util'),
			underTest;
	beforeEach(function () {
		underTest = new TableUtil();
	});
	describe('normaliseTitle', function () {
		it('lowercases the title', function () {
			expect(underTest.normaliseTitle('Cost')).toEqual('cost');
		});
	});
	describe('toHashArray', function () {
		it('returns empty array if table has no titles', function () {
			expect(underTest.toHashArray(
				{type: 'table', items: [[2, 4], [2, 1]]}
			)).toEqual([]);
		});
		it('converts a table with titles into an array of hashes normalising titles', function () {
			expect(underTest.toHashArray(
				{type: 'table', titles: ['benefit', 'Cost'], items: [[2, 4], [2, 1]]}
			)).toEqual([
				{benefit: 2, cost: 4},
				{benefit: 2, cost: 1}
			]);
		});
	});
});
