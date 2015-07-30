/*global describe, it, expect, require, beforeEach, jasmine*/

describe('StepExecutor', function () {
	'use strict';
	var StepExecutor = require('../src/daspec-step'),
		underTest,
		regexMatcher,
		processFunction;


	beforeEach(function () {
		regexMatcher = /this is a (match)/;
		processFunction = jasmine.createSpy('processFunction');
		underTest = new StepExecutor(regexMatcher, processFunction);
	});
	describe('executeTableRow', function () {
		it('should pass the the cell values to the process function as parameters', function () {
			underTest.executeTableRow('|one|two|three|');
			expect(processFunction).toHaveBeenCalledWith('one', 'two', 'three');
		});
	});
});
