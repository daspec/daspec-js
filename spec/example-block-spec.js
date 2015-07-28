/*global describe, it, expect, beforeEach, require */
describe('ExampleBlock', function () {
	'use strict';
	var underTest,
		ExampleBlock = require('../src/example-block');
	beforeEach(function () {

		underTest = new ExampleBlock();
	});
	describe('isComplete', function () {
		it('is false when the block is empty', function () {
			expect(underTest.isComplete()).toBeFalsy();
		});
		it('is false when the most recent line is a list item', function () {
			underTest.addLine('* list item');
			expect(underTest.isComplete()).toBeFalsy();
		});
		it('is true when the only line is a non list item', function () {
			underTest.addLine('not a list item');
			expect(underTest.isComplete()).toBeTruthy();
		});
		it('is true when the most recent line is a non list item', function () {
			underTest.addLine('* another list item');
			underTest.addLine('* a list item');
			underTest.addLine('not a list item');
			expect(underTest.isComplete()).toBeTruthy();
		});
	});
	describe('getMatchText', function () {
		it('is false when the block is empty', function () {
			expect(underTest.getMatchText()).toBeFalsy();
		});
		it('returns the top line when it is a non list item and not ignored', function () {
			underTest.addLine('* another list item');
			underTest.addLine('* a list item');
			underTest.addLine('not a list item');
			expect(underTest.getMatchText()).toEqual(['not a list item']);
		});
		it('returns the top line when it is the only line and is not ignored', function () {
			underTest.addLine('not a list item');
			expect(underTest.getMatchText()).toEqual(['not a list item']);
		});
		it('returns the top line when it is the only line and is ignored', function () {
			underTest.addLine('#not a list item');
			expect(underTest.getMatchText()).toEqual(['#not a list item']);
		});
		it('returns an array of all list items when the top line is ignored', function () {
			underTest.addLine('* another list item');
			underTest.addLine('* a list item');
			underTest.addLine('#not a list item');
			expect(underTest.getMatchText()).toEqual(['#not a list item', '* a list item', '* another list item']);
		});
		it('returns an array of all list items when there are no other lines', function () {
			underTest.addLine('* another list item');
			underTest.addLine('* a list item');
			expect(underTest.getMatchText()).toEqual(['* a list item', '* another list item']);
		});
	});
	describe('getList', function () {
		it('is false when the block is empty', function () {
			expect(underTest.getList()).toBeFalsy();
		});
		it('returns an array of list items when the top line  is a non list item and not ignored ', function () {
			underTest.addLine('* another list item');
			underTest.addLine('* a list item');
			underTest.addLine('not a list item');
			expect(underTest.getList()).toEqual({ordered: false, items:['a list item', 'another list item']});
		});
		it('returns false when the top line is ignored', function () {
			underTest.addLine('* another list item');
			underTest.addLine('* a list item');
			underTest.addLine('#not a list item');
			expect(underTest.getList()).toBeFalsy();
		});
		it('returns false when the top line is a list item', function () {
			underTest.addLine('* another list item');
			underTest.addLine('* a list item');
			expect(underTest.getList()).toBeFalsy();
		});
	});
});
