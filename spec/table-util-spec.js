/*global describe, it, expect, require, beforeEach */

describe('TableUtil', function () {
	'use strict';
	var TableUtil = require('../src/table-util'),
			underTest;
	beforeEach(function () {
		underTest = new TableUtil();
	});
	describe('justifyTable', function () {
		it('padds cells to fit max length values in each column with spaces around', function () {

			expect(underTest.justifyTable([
				'| short| loooooooooooong|',
				'|loooooong | short |',
				'|loooooong ||',
				'|short|short|'
			])).toEqual([
				'| short     | loooooooooooong |',
				'| loooooong | short           |',
				'| loooooong |                 |',
				'| short     | short           |'
			]);
		});
		it('expands row dividers without spaces', function () {
			expect(underTest.justifyTable([
				'| short| loooooooooooong|',
				'|-|-|',
				'|loooooong | short |',
				'|--|---|'
			])).toEqual([
				'| short     | loooooooooooong |',
				'|-----------|-----------------|',
				'| loooooong | short           |',
				'|-----------|-----------------|'
			]);
		});
		it('ignores manual spacing and dividers', function () {
			expect(underTest.justifyTable([
				'| short                             | loooooooooooong|',
				'|-|-------------------------------------------------------------|',
				'|loooooong | short |'
			])).toEqual([
				'| short     | loooooooooooong |',
				'|-----------|-----------------|',
				'| loooooong | short           |'
			]);
		});
		it('removes spacing before the first pipe', function () {
			expect(underTest.justifyTable([
				' | short | loooooooooooong|',
				'|loooooong | short |'
			])).toEqual([
				'| short     | loooooooooooong |',
				'| loooooong | short           |'
			]);
		});
	});
	describe('cellValuesForRow', function () {
		it('should return the values as an array', function () {
			expect(underTest.cellValuesForRow('|a|b|c|')).toEqual(['a', 'b', 'c']);
		});
		it('should trim the values', function () {
			expect(underTest.cellValuesForRow('  | a |\tb  |\tc\t|  ')).toEqual(['a', 'b', 'c']);
		});
		it('should return an empty array if not a table row', function () {
			expect(underTest.cellValuesForRow('   a \tb  \tc\t')).toEqual([]);
		});
		it('should return an empty array if empty string or undefined', function () {
			expect(underTest.cellValuesForRow('')).toEqual([]);
			expect(underTest.cellValuesForRow(' ')).toEqual([]);
			expect(underTest.cellValuesForRow()).toEqual([]);
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
