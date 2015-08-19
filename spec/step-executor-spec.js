/*global describe, it, expect, require, beforeEach, jasmine*/

describe('StepExecutor', function () {
	'use strict';
	var StepExecutor = require('../src/step-executor'),
		SpecContext = require('../src/context'),
		Assertion = require('../src/assertion'),
		tableMatcher = require('../src/matchers/table'),
		underTest,
		regexMatcher,
		processFunction,
		specContext;
	beforeEach(function () {
		regexMatcher = /this is a (.*)/;
		specContext = new SpecContext();
		processFunction = jasmine.createSpy('processFunction');
		underTest = new StepExecutor(regexMatcher, processFunction, specContext);
	});
	describe('executeTableRow', function () {
		it('should pass the the cell values to the process function as parameters - ' +
			' ignoring the regex matcher because it works on table headers', function () {
			underTest.executeTableRow('|one|two|three|');
			expect(processFunction).toHaveBeenCalledWith('one', 'two', 'three');
		});
	});
	describe('match', function () {
		it('returns true if the step regex matches the given string', function () {
			expect(underTest.match('this is a ball')).toBeTruthy();
			expect(underTest.match('this is not a ball')).toBeFalsy();
		});
		it('returns true if the step regex source equals the given regex', function () {
			expect(underTest.match(/this is a (.*)/)).toBeTruthy();
			expect(underTest.match(/this is a ball/)).toBeFalsy();
		});

	});
	describe('execute', function () {
		var equalNumberStep;
		beforeEach(function () {
			equalNumberStep = new StepExecutor(/equal numbers (\d*) = (\d*)/, function (first, second) {
				expect(first).toEqual(second);
			}, specContext);
		});
		it('should return result for non-positional, without an assertion index', function () {
			underTest = new StepExecutor(/this will pass/, function () {
				expect('expected').toEqual('expected');
			}, specContext);
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
			underTest = new StepExecutor(/this will fail/, function () {
				expect('not expected').toEqual('expected');
			}, specContext);
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
			underTest = new StepExecutor(/throw ([a-z]*)/, function (msg) {
				throw msg;
			}, specContext);
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
			underTest = new StepExecutor(/list of ([a-z]*)/, function (title, list) {
					expect([title]).toEqualSet(list.items);
				}, specContext);
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
			specContext.addMatchers(tableMatcher);
			underTest = new StepExecutor(/table of ([a-z]*)/, function (title, table) {
				expect([{name: 'yum'}]).toEqualUnorderedTable(table);
			}, specContext);
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
