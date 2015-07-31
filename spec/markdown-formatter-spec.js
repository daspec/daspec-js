/*global describe, expect, it, beforeEach, require */

describe('MarkDownFormatter', function () {
	'use strict';
	var MarkDownFormatter = require('../src/markdown-formatter'),
		underTest,
		dash = String.fromCharCode(8211),
		tick = String.fromCharCode(10003);
	beforeEach(function () {
		underTest = new MarkDownFormatter();
	});
	describe('formatPrimitiveResult', function () {
		it('bolds the expected result if passed', function () {
			expect(underTest.formatPrimitiveResult({expected: 3, value: 6, passed:true, index: 5})).toEqual({index:5, value:'**3**'});
		});
		it('crosses out and bolds the expected and bolds actual result if failed', function () {
			expect(underTest.formatPrimitiveResult({expected:3, value:6, passed:false, index: 1})).toEqual({index:1, value:'**~~3~~ [6]**'});
		});
	});
	describe('markResult', function () {
		it('marks a single indexed assertion as failed within a string if there are no unindexed failures', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/, assertions: [{expected: 4, index: 0, passed: false, value: 3}]})).toEqual('The number is **~~4~~ [3]**');
		});
		it('marks a single indexed success as bold within a string if there are no unindexed failures', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/,
				assertions: [{expected: 4, index: 0, passed: true, value: 3}]})).toEqual('The number is **4**');
		});
		it('does not mark indexed successes if there is a non-indexed failure', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/,
				assertions: [
					{expected: 4, index: 0, passed: true, value: 3},
					{passed: false}
				]})).toEqual('**~~The number is 4~~**');
		});
		it('does not mark indexed failures if there is a non-indexed failure', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/,
				assertions: [
					{expected: 4, index: 0, passed: false, value: 3},
					{passed: false}
				]})).toEqual('**~~The number is 4~~**');
		});
		it('does not mark indexed successes if there is a non-indexed success', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/,
				assertions: [
					{expected: 4, index: 0, passed: true, value: 3},
					{passed: true}
				]})).toEqual('**The number is 4**');
		});
		it('marks a non-indexed list failure as a list item', function () {
			expect(underTest.markResult({stepText: '* The number is 4', matcher: /.* (\d)/, assertions: [{passed: false}]})).toEqual('* **~~The number is 4~~**');
		});
		it('marks a non-indexed list success as a list item', function () {
			expect(underTest.markResult({stepText: '* The number is 4', matcher: /.* (\d)/, assertions: [{passed: true}]})).toEqual('* **The number is 4**');
		});
		it('marks a non-indexed table success as a table row', function () {
			expect(underTest.markResult({
				stepText: '|a|b|',
				assertions: [{passed: true}]
			})).toEqual('| **a** | **b** |');
		});
		it('marks a non-indexed table failure as a table item', function () {
			expect(underTest.markResult({
				stepText: '|a|b|',
				assertions: [{passed: false}]
			})).toEqual('| **~~a~~** | **~~b~~** |');
		});

		it('places the correct list symbol and indentation back', function () {
			expect(underTest.markResult({stepText: '  - The number is 4', matcher: /.* (\d)/, assertions: [{passed: true}]})).toEqual('  - **The number is 4**');
		});
		describe('exception reporting', function () {
			it('adds the exception as a comment after the result', function () {
				expect(underTest.markResult({
					stepText: 'The number is 4', matcher: /.* (\d)/,
					exception: 'Problem!'
				})).toEqual('**~~The number is 4~~**\n<!--\nProblem!\n-->');
			});
			it('does not mark indexed successes if there is an exception', function () {
				expect(underTest.markResult({
					stepText: 'The number is 4', matcher: /.* (\d)/,
					exception: 'Problem!',
					assertions: [
						{expected: 4, index: 0, passed: true, value: 3}
					]})).toEqual('**~~The number is 4~~**\n<!--\nProblem!\n-->');
			});
			it('does not mark indexed failures if there is an exception', function () {
				expect(underTest.markResult({
					stepText: 'The number is 4', matcher: /.* (\d)/,
					exception: 'Problem!',
					assertions: [
						{expected: 4, index: 0, passed: false, value: 3}
					]})).toEqual('**~~The number is 4~~**\n<!--\nProblem!\n-->');
			});
			it('does not mark non-indexed successes if there is an exception', function () {
				expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/,
					exception: 'Problem!',
					assertions: [
						{passed: true}
					]})).toEqual('**~~The number is 4~~**\n<!--\nProblem!\n-->');
			});
		});
		describe('attachment formatting', function () {
			describe('lists', function () {
				it('copies a list if there are no failed attachment assertions', function () {
					expect(underTest.markResult({
						stepText: 'Before list',
						attachment: {type: 'list', items: ['A', 'B']},
						matcher: /.* (\d)/,
						assertions: [{passed: true}]
					})).toEqual(
						'**Before list**\n' +
						'* A\n' +
						'* B'
					);
				});
				it('shows the list result of the first failed attachment assertion if there was one', function () {
					var list = {type: 'list', items: ['A', 'B']};
					expect(underTest.markResult({
						stepText: 'Before list',
						attachment: list,
						matcher: /.* (\d)/,
						assertions: [{passed: false, expected: list, value: {additional: ['f', 'g'] }}]
					})).toEqual(
						'**~~Before list~~**\n' +
						'* **[+] f**\n' +
						'* **[+] g**'
					);
				});
				it('reuses the list symbol if available', function () {
					var list = {type: 'list', items: ['A', 'B'], symbol: ' 1. '};
					expect(underTest.markResult({
						stepText: 'Before list',
						attachment: list,
						matcher: /.* (\d)/,
						assertions: [{passed: false, expected: list, value: {additional: ['f', 'g'] }}]
					})).toEqual(
						'**~~Before list~~**\n' +
						' 1. **[+] f**\n' +
						' 1. **[+] g**'
					);

				});
			});
			describe('tables', function () {
				describe('table formatting', function () {
					//TODO tests for formatting
					it('copies a table if there are no failed attachment assertions', function () {
						expect(underTest.markResult({
							stepText: 'Before table',
							attachment: {type: 'table', titles: ['A', 'B'], items: [[1, 2]]},
							matcher: /.* (\d)/,
							assertions: [{passed: true}]
						})).toEqual(
							'**Before table**\n' +
							'| A | B |\n' +
							'|---|---|\n' +
							'| 1 | 2 |');
					});
					it('contains no table header if the origin table did not have a header', function () {
						expect(underTest.markResult({
							stepText: 'Before table',
							attachment: {type: 'table', items: [[1, 2]]},
							matcher: /.* (\d)/,
							assertions: [{passed: true}]
						})).toEqual(
							'**Before table**\n' +
							'| 1 | 2 |');

					});
				});
			});
		});
	});
	describe('formatListResult', function () {

		it('ticks all matching lines, then reports missing followed by additional lines', function () {
			expect(underTest.formatListResult({matching: ['a', 'b', 'c'], missing: ['d', 'e'], additional: ['f', 'g']})).toEqual(
				[
					'[' + tick + '] a',
					'[' + tick + '] b',
					'[' + tick + '] c',
					'**[' + dash + '] ~~d~~**',
					'**[' + dash  + '] ~~e~~**',
					'**[+] f**',
					'**[+] g**'
				]);
		});
	});
	describe('getTableResult', function () {
		it('ticks all matching rows, then reports missing followed by additional rows', function () {
			expect(underTest.getTableResult({matching: [['a', 'b'], ['c', 'd']], missing: [['d', 'e']], additional: [['f', 'g']]})).toEqual(
				[
					[tick, 'a', 'b'],
					[tick, 'c', 'd'],
					[dash, '**~~d~~**', '**~~e~~**'],
					['+', '**f**', '**g**']
				]);
		});
	});

});
