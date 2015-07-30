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
		it('removes spaces', function () {
			expect(underTest.normaliseTitle('cost of delay')).toEqual('costofdelay');
		});
	});
	describe('normaliseObject', function () {
		it('returns a shallow-copy of the object with normalised keys', function () {
			expect(underTest.normaliseObject({'Cost of Action': 1, 'PROFIT': 2, costOfInaction: 'XXX'})).toEqual(
				{costofaction: 1, profit: 2, costofinaction: 'XXX'}
			);
		});
	});
	describe('tableValuesForTitles', function () {
		var table;
		beforeEach(function () {
			table = { type: 'table', titles: ['COST OF ACTION', 'profit'], items: [[1, 2], [3, 4], [5, 6]]};
		});
		it('returns a two-dimensional array with columns ordered according to specified titles', function () {
			expect(underTest.tableValuesForTitles(table, ['profit', 'cost of action'])).toEqual([[2, 1], [4, 3], [6, 5]]);
		});
		it('adds undefined values for missing columns', function () {
			expect(underTest.tableValuesForTitles(table, ['loss', 'cost of action'])).toEqual([[undefined, 1], [undefined, 3], [undefined, 5]]);
		});
		it('ignores additional columns', function () {
			expect(underTest.tableValuesForTitles(table, ['cost of action'])).toEqual([[1], [3], [5]]);
		});
		it('returns false if there are no titles', function () {
			expect(underTest.tableValuesForTitles(table, [])).toBeFalsy();
			expect(underTest.tableValuesForTitles(table)).toBeFalsy();
		});
	});
	describe('objectArrayValuesForTitles', function () {
		var list;
		beforeEach(function () {
			list = [{'cost of action': 1, profit: 2}, {'COST OF ACTION': 3, proFit: 4}, {costOfAction: 5, profit: 6 }];
		});
		it('returns a two-dimensional array with columns ordered according to specified titles', function () {
			expect(underTest.objectArrayValuesForTitles(list, ['profit', 'cost of action'])).toEqual([[2, 1], [4, 3], [6, 5]]);
		});
		it('adds undefined values for missing columns', function () {
			expect(underTest.objectArrayValuesForTitles(list, ['loss', 'cost of action'])).toEqual([[undefined, 1], [undefined, 3], [undefined, 5]]);
		});
		it('ignores additional columns', function () {
			expect(underTest.objectArrayValuesForTitles(list, ['cost of action'])).toEqual([[1], [3], [5]]);
		});
		it('returns false if there are no titles', function () {
			expect(underTest.objectArrayValuesForTitles(list, [])).toBeFalsy();
			expect(underTest.objectArrayValuesForTitles(list)).toBeFalsy();
		});

	});
});
