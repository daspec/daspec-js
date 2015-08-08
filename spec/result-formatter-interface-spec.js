/*global describe, it, expect, jasmine, beforeEach, require */
describe('Runner - Result Formatter Interface', function () {
	'use strict';
	var Runner = require('../src/runner'),
		Assertion = require('../src/assertion'),
		runner,
		stepFunc = function (context) {
			context.defineStep(/this will pass/, function () {
				this.assertEquals('expected', 'expected');
			});
			context.defineStep(/this will fail/, function () {
				this.assertEquals('expected', 'not expected');
			});
			context.defineStep(/equal numbers (\d*) = (\d*)/, function (first, second) {
				this.assertEquals(second, first, 1);
			});
			context.defineStep(/table of ([a-z]*)/, function (title, table) {
				this.assertUnorderedTableEquals(table, [{name: 'yum'}]);
			});
			context.defineStep(/list of ([a-z]*)/, function (title, list) {
				this.assertSetEquals(list.items, [title]);
			});
			context.defineStep(/throw ([a-z]*)/, function (msg) {
				throw msg;
			});
			context.defineStep(/\| number one \| number two \|/, function (first, second) {
				this.assertEquals(second, first, 1);
			});
		},
		resultFormatter,
		tableFormatter;
	beforeEach(function () {
		tableFormatter = jasmine.createSpyObj('table formatter', ['stepResult', 'nonAssertionLine']);
		resultFormatter = jasmine.createSpyObj('resultFormatter', ['stepResult', 'nonAssertionLine', 'appendResultBlock', 'skippedLine', 'tableResultBlock']);
		resultFormatter.tableResultBlock.and.returnValue(tableFormatter);
		runner = new Runner(stepFunc, resultFormatter);
	});
	it('receives a call to nonAssertionLine for things that are not even expected to match to steps', function () {
		runner.example('# header 1');
		expect(resultFormatter.nonAssertionLine).toHaveBeenCalledWith('# header 1');
	});
	it('receives a call to skippedLine for things that are expected to match steps, but no matching steps found', function () {
		runner.example('text line non matching steps');
		expect(resultFormatter.skippedLine).toHaveBeenCalledWith('text line non matching steps');
	});
	describe('stepResult', function () {
		it('receives calls for non-positional passing, without an assertion index', function () {
			runner.example('this will pass -- whole line');
			expect(resultFormatter.stepResult).toHaveBeenCalledWith({
				matcher: /this will pass/,
				stepText: 'this will pass -- whole line',
				attachment: false,
				assertions: [new Assertion('expected', 'expected', true)]
			});
		});
		it('receives calls for positional passing, with an index', function () {
			runner.example('equal numbers 5 = 5');
			expect(resultFormatter.stepResult).toHaveBeenCalledWith({
				matcher: /equal numbers (\d*) = (\d*)/,
				stepText: 'equal numbers 5 = 5',
				attachment: false,
				assertions: [new Assertion('5', '5', true, 1)]
			});
		});
		it('receives calls for for non-positional failure', function () {
			runner.example('this will fail -- whole line');
			expect(resultFormatter.stepResult).toHaveBeenCalledWith({
				matcher: /this will fail/,
				stepText: 'this will fail -- whole line',
				attachment: false,
				assertions: [new Assertion('expected', 'not expected', false)]
			});
		});
		it('receives calls for positional failures, with an index', function () {
			runner.example('equal numbers 5 = 6');
			expect(resultFormatter.stepResult).toHaveBeenCalledWith({
				matcher: /equal numbers (\d*) = (\d*)/,
				stepText: 'equal numbers 5 = 6',
				attachment: false,
				assertions: [new Assertion('6', '5', false, 1)]
			});
		});
		it('receives calls for exceptions, with an exception in the step result', function () {
			runner.example('throw blabla');
			expect(resultFormatter.stepResult).toHaveBeenCalledWith({
				matcher: /throw ([a-z]*)/,
				stepText: 'throw blabla',
				attachment: false,
				assertions: [],
				exception: 'blabla'
			});
		});
		it('receives a simple call for a list attachment', function () {
			runner.example('list of yum\n* yum');
			expect(resultFormatter.stepResult).toHaveBeenCalledWith({
				matcher: /list of ([a-z]*)/,
				stepText: 'list of yum',
				attachment: { type: 'list', ordered: false, items: ['yum'], symbol: '* ' },
				assertions: [
					new Assertion(
						['yum'],
						{ matches: true, missing: [  ], additional: [  ], matching: ['yum'] },
						true
					)
				]
			});
		});
		it('receives a simple call for a table attachment', function () {
			runner.example('table of yum\n|name|\n|---|\n|yum|');
			expect(resultFormatter.stepResult).toHaveBeenCalledWith({
				matcher: /table of ([a-z]*)/,
				stepText: 'table of yum',
				attachment: { type: 'table', titles: ['name'], items: [['yum']]},
				assertions: [new Assertion(
					[['yum']],
					{ matches: true, missing: [], additional: [], matching: [['yum']]},
					true)
				]
			});
		});
		describe('table handling', function () {
			it('resultFormatter receives a request for tableResultBlock for the first table item line', function () {
				runner.example('| number one | number two |\n|------|\n| 4 | 4 |');
				expect(resultFormatter.tableResultBlock).toHaveBeenCalled();
				expect(resultFormatter.stepResult).not.toHaveBeenCalled();
			});
			it('resultFormatter receives a call to skippedLine if the first table item does not match any steps', function () {
				runner.example('| number three | number four |');
				expect(resultFormatter.skippedLine).toHaveBeenCalledWith('| number three | number four |');
			});
			it('reports non assertion lines outside the table directly to result formatter, not the table formatter', function () {
				runner.example('#comment 1\n| number one | number two |\n|------|\n| 4 | 4 |');
				expect(resultFormatter.nonAssertionLine).toHaveBeenCalledWith('#comment 1');
			});
			it('the tableResultBlock result receives table headers and separators (even within the table) as nonAssertionLines', function () {
				runner.example('#comment 1\n| number one | number two |\n|------|\n| 4 | 4 |\n|--|--|\n| 5 | 5 |');
				expect(tableFormatter.nonAssertionLine.calls.count()).toBe(3);
				expect(tableFormatter.nonAssertionLine.calls.allArgs()).toEqual([
					['| number one | number two |'],
					['|------|'],
					['|--|--|']
				]);
			});
			it('the tableResultBlock result receives table data rows as stepResult', function () {
				runner.example('#comment 1\n| number one | number two |\n|------|\n| 4 | 4 |\n|--|--|\n| 4 | 5 |');
				expect(tableFormatter.stepResult.calls.count()).toBe(2);
				expect(tableFormatter.stepResult.calls.allArgs()).toEqual([
					[{ matcher: /\|(.*)\|(.*)\|/, stepText: '| 4 | 4 |', assertions: [new Assertion('4', '4', true, 1)]}],
					[{ matcher: /\|(.*)\|(.*)\|/, stepText: '| 4 | 5 |', assertions: [new Assertion('5', '4', false, 1)]}]
				]);

			});
			it('resultFormatter receives a call to appendResultBlock with the tableResultBlock when the table completes', function () {
				runner.example('#comment 1\n| number one | number two |\n|------|\n| 4 | 4 |\n|--|--|\n| 5 | 5 |');
				expect(resultFormatter.appendResultBlock).toHaveBeenCalledWith(tableFormatter);
			});
			it('reports multiple tables within the same block individually', function () {
				var tableFormatters = [];
				resultFormatter.tableResultBlock.and.callFake(function () {
					var formatter = jasmine.createSpyObj('table formatter', ['stepResult', 'nonAssertionLine']);
					tableFormatters.push(formatter);
					return formatter;
				});

				runner.example('#comment 1\n| number one | number two |\n|------|\n| 4 | 4 |\n\n| number one | number two |\n|--|--|\n| 5 | 5 |');
				expect(tableFormatters.length).toEqual(2);
				expect(resultFormatter.appendResultBlock.calls.count()).toEqual(2);
				expect(resultFormatter.appendResultBlock.calls.argsFor(0)).toEqual([tableFormatters[0]]);
				expect(resultFormatter.appendResultBlock.calls.argsFor(1)).toEqual([tableFormatters[1]]);

				expect(tableFormatters[0].stepResult).toHaveBeenCalledWith(
					{ matcher: /\|(.*)\|(.*)\|/, stepText: '| 4 | 4 |', assertions: [new Assertion('4', '4', true, 1)]}
				);
				expect(tableFormatters[1].stepResult).toHaveBeenCalledWith(
					{ matcher: /\|(.*)\|(.*)\|/, stepText: '| 5 | 5 |', assertions: [new Assertion('5', '5', true, 1)]}
				);
			});
		});
	});
});
