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
			expect(underTest.formatPrimitiveResult({expected: 3, actual: 6, passed:true, position: 5})).toEqual({position:5, actual:'**3**'});
		});
		it('crosses out and bolds the expected and bolds actual result if failed', function () {
			expect(underTest.formatPrimitiveResult({expected:3, actual:6, passed:false, position: 1})).toEqual({position:1, actual:'**~~3~~ [6]**'});
		});
	});
	describe('markResult', function () {
		it('marks a single indexed assertion as failed within a string if there are no unindexed failures', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/, assertions: [{expected: 4, position: 0, passed: false, actual: 3}]})).toEqual('The number is **~~4~~ [3]**');
		});
		it('marks a single indexed success as bold within a string if there are no unindexed failures', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/,
				assertions: [{expected: 4, position: 0, passed: true, actual: 3}]})).toEqual('The number is **4**');
		});
		it('does not mark indexed successes if there is a non-indexed failure', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/,
				assertions: [
					{expected: 4, position: 0, passed: true, actual: 3},
					{passed: false}
				]})).toEqual('**~~The number is 4~~**');
		});
		it('does not mark indexed failures if there is a non-indexed failure', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/,
				assertions: [
					{expected: 4, position: 0, passed: false, actual: 3},
					{passed: false}
				]})).toEqual('**~~The number is 4~~**');
		});
		it('does not mark indexed successes if there is a non-indexed success', function () {
			expect(underTest.markResult({stepText: 'The number is 4', matcher: /.* (\d)/,
				assertions: [
					{expected: 4, position: 0, passed: true, actual: 3},
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
						{expected: 4, index: 0, passed: true, actual: 3}
					]})).toEqual('**~~The number is 4~~**\n<!--\nProblem!\n-->');
			});
			it('does not mark indexed failures if there is an exception', function () {
				expect(underTest.markResult({
					stepText: 'The number is 4', matcher: /.* (\d)/,
					exception: 'Problem!',
					assertions: [
						{expected: 4, index: 0, passed: false, actual: 3}
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
						'**Before list**\n\n' +
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
						assertions: [{passed: false, expected: list, detail: {additional: ['f', 'g'] }}]
					})).toEqual(
						'**~~Before list~~**\n\n' +
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
						assertions: [{passed: false, expected: list, detail: {additional: ['f', 'g'] }}]
					})).toEqual(
						'**~~Before list~~**\n\n' +
						' 1. **[+] f**\n' +
						' 1. **[+] g**'
					);
				});
				it('shows the list items as checked if there are no failed, but there is a passed attachment assertion', function () {
					var list = {type: 'list', items: ['A', 'B']};
					expect(underTest.markResult({
						stepText: 'Before list',
						attachment: list,
						matcher: /.* (\d)/,
						assertions: [{passed: true, expected: list.items}]
					})).toEqual(
						'**Before list**\n\n' +
						'* [' + tick + '] A\n' +
						'* [' + tick + '] B'
					);
				});
				it('shows the failure if there are both failed and passed list assertions', function () {
					var list = {type: 'list', items: ['A', 'B']};
					expect(underTest.markResult({
						stepText: 'Before list',
						attachment: list,
						matcher: /.* (\d)/,
						assertions: [{passed: false, expected: list, detail: {additional: ['f', 'g'] }}, {passed: true, expected: list.items}]
					})).toEqual(
						'**~~Before list~~**\n\n' +
						'* **[+] f**\n' +
						'* **[+] g**'
					);
				});
			});
			describe('tables', function () {
				describe('table formatting', function () {
					it('copies a table if there are no failed attachment assertions', function () {
						expect(underTest.markResult({
							stepText: 'Before table',
							attachment: {type: 'table', titles: ['A', 'B'], items: [[1, 2]]},
							matcher: /.* (\d)/,
							assertions: [{passed: true}]
						})).toEqual(
							'**Before table**\n\n' +
							'| A | B |\n' +
							'|---|---|\n' +
							'| 1 | 2 |');
					});
					it('formats the results if there are failed attachment assertions', function () {
						var attachment = {type: 'table', titles: ['A', 'B'], items: [[1, 2]]};
						expect(underTest.markResult({
							stepText: 'Before table',
							attachment: attachment,
							matcher: /.* (\d)/,
							assertions: [{passed: false, expected: attachment, detail: {additional: [['f', 'g']]}}]
						})).toEqual(
							'**~~Before table~~**\n\n' +
							'| ? | A     | B     |\n' +
							'|---|-------|-------|\n' +
							'| + | **f** | **g** |'
						);
					});
					it('formats the results as passed if there are passed failed attachment assertions, but no failed ones', function () {
						var attachment = {type: 'table', titles: ['A', 'B'], items: [[1, 2]]};
						expect(underTest.markResult({
							stepText: 'Before table',
							attachment: attachment,
							matcher: /.* (\d)/,
							assertions: [{passed: true, expected: attachment}]
						})).toEqual(
							'**Before table**\n\n' +
							'| ? | A | B |\n' +
							'|---|---|---|\n' +
							'| ' + tick + ' | 1 | 2 |'
						);
					});
					it('formats the results as failed if there are both passed and failed attachment assertions', function () {
						var attachment = {type: 'table', titles: ['A', 'B'], items: [[1, 2]]};
						expect(underTest.markResult({
							stepText: 'Before table',
							attachment: attachment,
							matcher: /.* (\d)/,
							assertions: [{passed: true, expected: attachment}, {passed: false, expected: attachment, detail: {additional: [['f', 'g']]}}]
						})).toEqual(
							'**~~Before table~~**\n\n' +
							'| ? | A     | B     |\n' +
							'|---|-------|-------|\n' +
							'| + | **f** | **g** |'
						);
					});
					it('contains no table header if the origin table did not have a header', function () {
						expect(underTest.markResult({
							stepText: 'Before table',
							attachment: {type: 'table', items: [[1, 2]]},
							matcher: /.* (\d)/,
							assertions: [{passed: true}]
						})).toEqual(
							'**Before table**\n\n' +
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
