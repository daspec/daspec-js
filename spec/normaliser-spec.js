/*global describe, it, expect, require, beforeEach */

describe('Normaliser', function () {
	'use strict';
	var Normaliser = require('../src/normaliser'),
		underTest;
	beforeEach(function () {
		underTest = new Normaliser();
	});
	describe('normaliseString', function () {
		it('lowercases the title', function () {
			expect(underTest.normaliseString('Cost')).toEqual('cost');
		});
		it('removes spaces', function () {
			expect(underTest.normaliseString('cost of delay')).toEqual('costofdelay');
		});
	});
	describe('normaliseObject', function () {
		it('returns a shallow-copy of the object with normalised keys', function () {
			expect(underTest.normaliseObject({'Cost of Action': 1, 'PROFIT': 2, costOfInaction: 'XXX'})).toEqual(
				{costofaction: 1, profit: 2, costofinaction: 'XXX'}
			);
		});
		it('does not change the original object', function () {
			var o = {'Cost of Action': 1, 'PROFIT': 2, costOfInaction: 'XXX'};
			underTest.normaliseObject(o);
			expect(o).toEqual({'Cost of Action': 1, 'PROFIT': 2, costOfInaction: 'XXX'});
		});
		it('should return an array unchanged', function () {
			expect(underTest.normaliseObject([1, 2, 3])).toEqual([1, 2, 3]);
		});
	});
	describe('containsDuplicates', function () {
		it('returns true if an array of strings contains equivalent strings when normalised', function () {
			expect(underTest.containsDuplicates(['Cost of Action', 'PROFIT', 'cost of action'])).toBeTruthy();
		});
		it('returns false if an array of strings does not contain any duplicated strings when normalised', function () {
			expect(underTest.containsDuplicates(['Cost of Action', 'PROFIT'])).toBeFalsy();
		});
		it('does not change the original array', function () {
			var a = ['Cost of Action', 'PROFIT'];
			underTest.containsDuplicates(a);
			expect(a).toEqual(['Cost of Action', 'PROFIT']);
		});
		it('returns false for an empty array', function () {
			expect(underTest.containsDuplicates()).toBeFalsy();
			expect(underTest.containsDuplicates([])).toBeFalsy();
		});
	});
	describe('normaliseValue', function () {
		it('trims strings', function () {
			expect(underTest.normaliseValue(' a ')).toEqual('a');
			expect(underTest.normaliseValue('  ')).toEqual('');
			expect(underTest.normaliseValue('')).toEqual('');
			expect(underTest.normaliseValue(' 10b ')).toEqual('10b');
			expect(underTest.normaliseValue('\tc10\t')).toEqual('c10');
		});
		it('optimistically parsed numbers into floats', function () {
			expect(underTest.normaliseValue(' 10.001 ')).toEqual(10.001);
			expect(underTest.normaliseValue('\t10\t')).toEqual(10);
		});
		it('returns undefined is passed nothing', function () {
			expect(underTest.normaliseValue()).toBeUndefined();
		});
		it('returns non string values untouched', function () {
			expect(underTest.normaliseValue({foo:1})).toEqual({foo:1});
			expect(underTest.normaliseValue(10.1)).toEqual(10.1);
			expect(underTest.normaliseValue(false)).toBe(false);
			expect(underTest.normaliseValue(NaN)).toBeNaN();
		});

	});
});
