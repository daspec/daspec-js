/*global describe, it, expect, require, beforeEach, jasmine*/

describe('StepExecutor', function () {
	'use strict';
	var StepExecutor = require('../src/step-executor'),
		SpecContext = require('../src/context'),
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
		underTest = new StepExecutor({matcher: regexMatcher, processFunction: processFunction}, specContext);
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
			var result;
			underTest = new StepExecutor({matcher: /this will pass/, processFunction: function () {
				expect('expected').toEqual('expected');
			}}, specContext);
			result = underTest.execute('this will pass -- whole line', false);
			expect(result).toEqual(
				jasmine.objectContaining({
					matcher: /this will pass/,
					stepText: 'this will pass -- whole line',
					attachment: false,
					assertions: [{expected: 'expected', actual: 'expected', passed: true}]
				})
			);
		});

		it('should return result for positional passing, with an index', function () {
			var result = equalNumberStep.execute('equal numbers 5 = 5', false);
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /equal numbers (\d*) = (\d*)/,
				stepText: 'equal numbers 5 = 5',
				attachment: false,
				assertions: [{expected: 5, actual: 5, passed: true, position: 1}]
			}));
		});
		it('should return result for non-positional failure', function () {
			var result;
			underTest = new StepExecutor({matcher: /this will fail/, processFunction: function () {
				expect('not expected').toEqual('expected');
			}}, specContext);
			result = underTest.execute('this will fail -- whole line', false);
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /this will fail/,
				stepText: 'this will fail -- whole line',
				attachment: false,
				assertions: [{expected: 'expected', actual: 'not expected', passed: false}]
			}));
		});
		it('should return result for positional failures, with an index', function () {
			var result = equalNumberStep.execute('equal numbers 5 = 6', false);
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /equal numbers (\d*) = (\d*)/,
				stepText: 'equal numbers 5 = 6',
				attachment: false,
				assertions: [{expected: 6, actual: 5, passed: false, position: 1}]
			}));
		});
		it('should return result for exceptions, with an exception in the step result', function () {
			var result;
			underTest = new StepExecutor({matcher: /throw ([a-z]*)/, processFunction: function (msg) {
				throw msg;
			}}, specContext);
			result = underTest.execute('throw blabla', false);
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /throw ([a-z]*)/,
				stepText: 'throw blabla',
				attachment: false,
				assertions: [],
				exception: 'blabla'
			}));
		});

		it('receives a simple call for a list attachment', function () {
			var expected, result;
			underTest = new StepExecutor({matcher: /list of ([a-z]*)/, processFunction: function (title, list) {
				expect([title]).toEqualSet(list);
			}}, specContext);
			expected = { type: 'list', ordered: false, items: ['yum'], symbol: '* ' };
			result = underTest.execute('list of yum', expected);
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /list of ([a-z]*)/,
				stepText: 'list of yum',
				attachment: expected,
				assertions: [
					{
						expected: expected,
						actual: ['yum'],
						detail: { matches: true, missing: [  ], additional: [  ], matching: ['yum'] },
						passed: true,
						position: 1
					}
				]
			}));
		});
		it('receives a simple call for a table attachment', function () {
			var expected, result;
			underTest = new StepExecutor({matcher: /table of ([a-z]*)/, processFunction: function (title, table) {
				expect([{name: 'yum'}]).toEqualUnorderedTable(table);
			}}, specContext);
			expected = { type: 'table', titles: ['name'], items: [['yum']]};
			result = underTest.execute('table of yum', expected);
			expect(result).toEqual(jasmine.objectContaining({
				matcher: /table of ([a-z]*)/,
				stepText: 'table of yum',
				attachment: expected,
				assertions: [
					{
						expected: expected,
						detail: { matches: true, missing: [], additional: [], matching: [['yum']]},
						actual: [{name: 'yum'}],
						passed: true,
						position: 1
					}
				]
			}));
		});

	});
});
