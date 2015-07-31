/*global describe, it, expect, require, beforeEach, jasmine*/

describe('StepExecutor', function () {
	'use strict';
	var StepExecutor = require('../src/step-executor'),
		underTest,
		regexMatcher,
		processFunction;


	beforeEach(function () {
		regexMatcher = /this is a (.*)/;
		processFunction = jasmine.createSpy('processFunction');
		underTest = new StepExecutor(regexMatcher, processFunction);
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
});
