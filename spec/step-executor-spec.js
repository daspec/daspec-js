/*global describe, it, expect, require, beforeEach, jasmine*/

describe('StepExecutor', function () {
	'use strict';
	var StepExecutor = require('../src/step-executor'),
		SpecContext = require('../src/context'),
		Assertion = require('../src/assertion'),
		tableMatcher = require('../src/matchers/table'),
		listMatcher = require('../src/matchers/list'),
		underTest,
		regexMatcher,
		processFunction,
		specContext;
	beforeEach(function () {
		regexMatcher = /this is a (.*)/;
		specContext = new SpecContext();
		specContext.addMatchers(tableMatcher);
		specContext.addMatchers(listMatcher);
		processFunction = jasmine.createSpy('processFunction');
		underTest = new StepExecutor({matcher:regexMatcher, processFunction:processFunction}, specContext);
	});
	describe('executeTableRow', function () {
		it('should pass the the cell values to the process function as parameters - ' +
			' ignoring the regex matcher because it works on table headers', function () {
			underTest.executeTableRow('|one|two|three|');
			expect(processFunction).toHaveBeenCalledWith('one', 'two', 'three');
		});
	});
	describe('execute', function () {
		var equalNumberStep;
		beforeEach(function () {
			equalNumberStep = new StepExecutor({matcher: /equal numbers (\d*) = (\d*)/, processFunction: function (first, second) {
				expect(first).toEqual(second);
			}}, specContext);
		});
		it('should return result for non-positional, without an assertion index', function () {
			underTest = new StepExecutor({matcher:/this will pass/, processFunction: function () {
				expect('expected').toEqual('expected');
			}}, specContext);
			var result = underTest.execute('this will pass -- whole line', false);
			expect(result).toEqual(
				jasmine.objectContaining({
					matcher: /this will pass/,
					stepText: 'this will pass -- whole line',
					attachment: false,
					assertions: [new Assertion('expected', 'expected', true)]
				})
			);
		});

		it('should return result for positional passing, with an index', function () {
			var result = equalNumberStep.execute('equal numbers 5 = 5', false);
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /equal numbers (\d*) = (\d*)/,
				stepText: 'equal numbers 5 = 5',
				attachment: false,
				assertions: [new Assertion(5, 5, true, 1)]
			}));
		});
		it('should return result for non-positional failure', function () {
			underTest = new StepExecutor({matcher: /this will fail/, processFunction: function () {
				expect('not expected').toEqual('expected');
			}}, specContext);
			var result = underTest.execute('this will fail -- whole line', false);
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /this will fail/,
				stepText: 'this will fail -- whole line',
				attachment: false,
				assertions: [new Assertion('expected', 'not expected', false)]
			}));
		});
		it('should return result for positional failures, with an index', function () {
			var result = equalNumberStep.execute('equal numbers 5 = 6', false);
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /equal numbers (\d*) = (\d*)/,
				stepText: 'equal numbers 5 = 6',
				attachment: false,
				assertions: [new Assertion(6, 5, false, 1)]
			}));
		});
		it('should return result for exceptions, with an exception in the step result', function () {
			underTest = new StepExecutor({matcher: /throw ([a-z]*)/, processFunction: function (msg) {
				throw msg;
			}}, specContext);
			var result = underTest.execute('throw blabla', false);
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /throw ([a-z]*)/,
				stepText: 'throw blabla',
				attachment: false,
				assertions: [],
				exception: 'blabla'
			}));
		});

		it('receives a simple call for a list attachment', function () {
			underTest = new StepExecutor({matcher: /list of ([a-z]*)/, processFunction: function (title, list) {
					expect([title]).toEqualSet(list.items);
				}}, specContext);
			var result = underTest.execute('list of yum', { type: 'list', ordered: false, items: ['yum'], symbol: '* ' });
			expect(result).toEqual(jasmine.objectContaining({
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
			}));
		});
		it('receives a simple call for a table attachment', function () {

			underTest = new StepExecutor({matcher: /table of ([a-z]*)/, processFunction: function (title, table) {
				expect([{name: 'yum'}]).toEqualUnorderedTable(table);
			}}, specContext);
			var result = underTest.execute('table of yum', { type: 'table', titles: ['name'], items: [['yum']]});
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /table of ([a-z]*)/,
				stepText: 'table of yum',
				attachment: { type: 'table', titles: ['name'], items: [['yum']]},
				assertions: [new Assertion(
					[['yum']],
					{ matches: true, missing: [], additional: [], matching: [['yum']]},
					true)
				]
			}));
		});

	});
});
