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
});
