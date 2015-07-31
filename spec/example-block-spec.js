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
		it('is false when the most recent line is a table item', function () {
			underTest.addLine('| table item |');
			expect(underTest.isComplete()).toBeFalsy();
		});
		it('is false when the last line is blank', function () {
			underTest.addLine('* a list item');
			underTest.addLine('');
			expect(underTest.isComplete()).toBeFalsy();
		});
		it('is false when the last line is space-only', function () {
			underTest.addLine('* a list item');
			underTest.addLine('  ');
			expect(underTest.isComplete()).toBeFalsy();
		});
		it('is false when the last line is tab-only', function () {
			underTest.addLine('* a list item');
			underTest.addLine('\t');
			expect(underTest.isComplete()).toBeFalsy();
		});
		/*TODO: complete a block if a list switches to a table or a table switches to a list */
	});
	describe('isTableBlock', function () {
		it('returns true when the block is just a table', function () {
			underTest.addLine('|one|');
			underTest.addLine('|---|');
			underTest.addLine('|title|');
			expect(underTest.isTableBlock()).toBeTruthy();
		});
		it('returns false when the block does not contain a table', function () {
			underTest.addLine('* a list item');
			expect(underTest.isTableBlock()).toBeFalsy();
		});
		it('returns true when the block contains separate tables', function () {
			underTest.addLine('|one|');
			underTest.addLine('|---|');
			underTest.addLine('|title|');
			underTest.addLine('');
			underTest.addLine('|two|');
			underTest.addLine('|---|');
			underTest.addLine('|titleTwo|');
			expect(underTest.isTableBlock()).toBeTruthy();
		});
		it('returns false when the block has an assertion line above a table', function () {
			underTest.addLine('|one|');
			underTest.addLine('|---|');
			underTest.addLine('|title|');
			underTest.addLine('the table is an attachment');
			expect(underTest.isTableBlock()).toBeFalsy();
		});
		it('returns false when the block has an assertion line above a table with a separating line', function () {
			underTest.addLine('|one|');
			underTest.addLine('|---|');
			underTest.addLine('|title|');
			underTest.addLine('');
			underTest.addLine('the table is an attachment');
			expect(underTest.isTableBlock()).toBeFalsy();
		});
		it('returns true when the block has a non assertion line above a table', function () {
			underTest.addLine('|one|');
			underTest.addLine('|---|');
			underTest.addLine('|title|');
			underTest.addLine('>the table is not an attachment');
			expect(underTest.isTableBlock()).toBeTruthy();
		});
		it('returns true when the block has a non assertion line above a table with a separating space', function () {
			underTest.addLine('|one|');
			underTest.addLine('|---|');
			underTest.addLine('|title|');
			underTest.addLine('');
			underTest.addLine('>the table is not an attachment');
			expect(underTest.isTableBlock()).toBeTruthy();
		});
		it('returns true when the block has a non assertion line below a table', function () {
			underTest.addLine('>the table is not an attachment');
			underTest.addLine('|one|');
			underTest.addLine('|---|');
			underTest.addLine('|title|');
			expect(underTest.isTableBlock()).toBeTruthy();
		});
		it('returns true when the block has a non assertion line below a table with a separating space', function () {
			underTest.addLine('>the table is not an attachment');
			underTest.addLine('');
			underTest.addLine('|one|');
			underTest.addLine('|---|');
			underTest.addLine('|title|');
			expect(underTest.isTableBlock()).toBeTruthy();
		});
	});
	describe('getMatchText', function () {
		it('is an empty array when the block is empty', function () {
			expect(underTest.getMatchText()).toEqual([]);
		});
		it('returns the top line when it is a non list item and not ignored', function () {
			underTest.addLine('* another list item');
			underTest.addLine('* a list item');
			underTest.addLine('not a list item');
			expect(underTest.getMatchText()).toEqual(['not a list item']);
		});
		it('returns the top line when it is a non-table item, followed by a table, and it is not ignored', function () {
			underTest.addLine('|2.1 |      2.2 |');
			underTest.addLine('|1.1\t \t|\t 1.2|');
			underTest.addLine('not a table item');
			expect(underTest.getMatchText()).toEqual(['not a table item']);
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
	describe('getAttachment', function () {
		it('is false when the block is empty', function () {
			expect(underTest.getAttachment()).toBeFalsy();
		});
		it('is false when no table or list', function () {
			underTest.addLine('not a list item');
			expect(underTest.getAttachment()).toBeFalsy();
		});
		it('gets the list when a list is inside a block', function () {
			underTest.addLine('* another list item');
			underTest.addLine('* a list item');
			underTest.addLine('not a list item');
			expect(underTest.getAttachment()).toEqual({type: 'list', ordered: false, items:['a list item', 'another list item']});
		});
		it('gets the table when a table is inside a block', function () {
			underTest.addLine('|another table item|');
			underTest.addLine('|a table item|');
			underTest.addLine('not a list item');
			expect(underTest.getAttachment().type).toEqual('table');
			expect(underTest.getAttachment().items).toEqual([['a table item'], ['another table item']]);
		});
		describe('table attachments', function () {
			it('gets the table rows as an array, indexed by columns, when there is no heading row', function () {
				underTest.addLine('|another table item|');
				underTest.addLine('|a table item|');
				underTest.addLine('not a table item');
				expect(underTest.getAttachment().type).toEqual('table');
				expect(underTest.getAttachment().items).toEqual([['a table item'], ['another table item']]);
			});
			it('ignores blank lines at the start when retrieving the table', function () {
				underTest.addLine('|another table item|');
				underTest.addLine('|a table item|');
				underTest.addLine('');
				underTest.addLine('not a table item');
				expect(underTest.getAttachment().type).toEqual('table');
				expect(underTest.getAttachment().items).toEqual([['a table item'], ['another table item']]);
			});
			it('trims cell values', function () {
				underTest.addLine('|2.1 |      2.2 |');
				underTest.addLine('|1.1\t \t|\t 1.2|');
				underTest.addLine('not a table item');
				expect(underTest.getAttachment().items).toEqual([['1.1', '1.2'], ['2.1', '2.2']]);
			});
			it('gets the table with a header row', function () {
				underTest.addLine('|2.1|2.2|');
				underTest.addLine('|1.1|1.2|');
				underTest.addLine('|---|---|');
				underTest.addLine('|H1|H2|');
				underTest.addLine('not a table item');

				expect(underTest.getAttachment().type).toEqual('table');
				expect(underTest.getAttachment().titles).toEqual(['H1', 'H2']);
				expect(underTest.getAttachment().items).toEqual([['1.1', '1.2'], ['2.1', '2.2']]);
			});
		});
		describe('list attachments', function () {
			it('returns an array of list items when the top line  is a non list item and not ignored ', function () {
				underTest.addLine('* another list item');
				underTest.addLine('* a list item');
				underTest.addLine('not a list item');
				expect(underTest.getAttachment()).toEqual({type: 'list', ordered: false, items:['a list item', 'another list item']});
			});
			it('works even when there are spaces between the list and the top item', function () {
				underTest.addLine('* another list item');
				underTest.addLine('* a list item');
				underTest.addLine('');
				underTest.addLine('not a list item');
				expect(underTest.getAttachment()).toEqual({type: 'list', ordered: false, items:['a list item', 'another list item']});
			});
			it('returns false when the top line is ignored', function () {
				underTest.addLine('* another list item');
				underTest.addLine('* a list item');
				underTest.addLine('#not a list item');
				expect(underTest.getAttachment()).toBeFalsy();
			});
			it('returns false when the top line is a list item', function () {
				underTest.addLine('* another list item');
				underTest.addLine('* a list item');
				expect(underTest.getAttachment()).toBeFalsy();
			});
		});
	});
});
