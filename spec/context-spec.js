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
			var result;
			underTest.addMatchers({
				toFoo: function () {
					this.addAssertion(this.actual === 'foo', 'foo');
					return this;
				}
			});
			result = underTest.expect('Mike').toFoo();
			expect(result.assertions.length).toBe(1);
			expect(result.assertions[0]).toEqual(jasmine.objectContaining({expected: 'foo', actual: 'Mike', passed: false}));
		});
		it('can be called multiple times', function () {
			var result;
			underTest.addMatchers({
				toFoo: function () {
					this.addAssertion(this.actual === 'foo', 'foo');
					return this;
				}
			});
			underTest.addMatchers({
				toBar: function () {
					this.addAssertion(this.actual === 'bar', 'bar');
					return this;
				}
			});
			result = underTest.expect('Mike').toFoo().toBar();
			expect(result.assertions.length).toBe(2);
			expect(result.assertions[0]).toEqual(jasmine.objectContaining({expected: 'foo', actual: 'Mike', passed: false}));
			expect(result.assertions[1]).toEqual(jasmine.objectContaining({expected: 'bar', actual: 'Mike', passed: false}));
		});
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
