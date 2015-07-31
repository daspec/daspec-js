/*global require, describe, it, expect, beforeEach, jasmine */

describe('Context', function () {
	'use strict';
	var Context = require('../src/daspec-context'),
		underTest,
		processor,
		processorTwo;
	beforeEach(function () {
		underTest = new Context();
		processor = jasmine.createSpy('processor');
		processorTwo = jasmine.createSpy('processorTwo');
	});
	describe('defineStep', function () {

		it('adds a processor function for a regular expression', function () {
			underTest.defineStep(/Who is (.*)/, processor);
			var executor = underTest.getStepForLine('Who is Mike');
			executor.execute('Who is Mike');
			expect(processor).toHaveBeenCalledWith('Mike');
		});
		it('throws an error if a step for the same regex is already defined', function () {
			underTest.defineStep(/Who is (.*)/, processor);
			expect(function () {
				underTest.defineStep(/Who is (.*)/, processorTwo);
			}).toThrowError(Error, 'the matching step is already defined');
		});
	});
	describe('getStepForLine', function () {
		it('retrieves a step matching the line by regex', function () {
			underTest.defineStep(/Who is (.*)/, processor);
			underTest.defineStep(/Who was (.*)/, processorTwo);

			var executor = underTest.getStepForLine('Who was Mike');
			executor.execute('Who was Mike');
			expect(processorTwo).toHaveBeenCalledWith('Mike');
			expect(processor).not.toHaveBeenCalled();
		});
		it('throws an error if multiple steps match the line', function () {
			underTest.defineStep(/Who is (.*)/, processor);
			underTest.defineStep(/Who .s (.*)/, processorTwo);

			expect(function () {
				underTest.getStepForLine('Who is Mike');
			}).toThrowError(Error, 'multiple steps match line Who is Mike');
		});
		it('returns false if nothing matches', function () {
			underTest.defineStep(/Who is (.*)/, processor);

			expect(underTest.getStepForLine('Who was Mike')).toBeFalsy();
		});
	});

});
