/*global require, describe, it, expect, beforeEach, jasmine */

describe('Context', function () {
	'use strict';
	var Context = require('../src/context'),
		underTest,
		processor,
		processorTwo;
	beforeEach(function () {
		underTest = new Context();
		processor = jasmine.createSpy('processor');
		processorTwo = jasmine.createSpy('processorTwo');
	});
	describe('addMatchers', function () {
		it('makes matchers available to steps', function () {
			underTest.addMatchers('x');
			underTest.addMatchers('y');
			expect(underTest.getMatchers()).toEqual(['x', 'y']);
		});
	});
	describe('defineStep', function () {

		it('adds a processor function for a regular expression', function () {
			underTest.defineStep(/Who is (.*)/, processor);
			var executor = underTest.getStepDefinitionForLine('Who is Mike');
			expect(executor.matcher.test('Who is Mike')).toBeTruthy();
			expect(executor.processFunction).toEqual(processor);
		});
		it('throws an error if a step for the same regex is already defined', function () {
			underTest.defineStep(/Who is (.*)/, processor);
			expect(function () {
				underTest.defineStep(/Who is (.*)/, processorTwo);
			}).toThrowError(Error, 'The matching step is already defined');
		});
		it('throws an error when non-capture groups are used', function () {
			expect(function () {
				underTest.defineStep(/Who is (?:.*)/, processorTwo);
			}).toThrowError(Error, 'Non-capturing regex groups are not supported');
		});
		it('throws an error when regex is not defined', function () {
			expect(function () {
				underTest.defineStep(undefined, processorTwo);
			}).toThrowError(Error, 'Empty matchers are not supported');
		});
	});
	describe('getStepDefinitionForLine', function () {
		it('retrieves a step matching the line by regex', function () {
			underTest.defineStep(/Who is (.*)/, processor);
			underTest.defineStep(/Who was (.*)/, processorTwo);

			var executor = underTest.getStepDefinitionForLine('Who was Mike');
			expect(executor.processFunction).toBe(processorTwo);
		});
		it('throws an error if multiple steps match the line', function () {
			underTest.defineStep(/Who is (.*)/, processor);
			underTest.defineStep(/Who .s (.*)/, processorTwo);

			expect(function () {
				underTest.getStepDefinitionForLine('Who is Mike');
			}).toThrowError(Error, 'multiple steps match line Who is Mike');
		});
		it('returns false if nothing matches', function () {
			underTest.defineStep(/Who is (.*)/, processor);

			expect(underTest.getStepDefinitionForLine('Who was Mike')).toBeFalsy();
		});
	});

});
