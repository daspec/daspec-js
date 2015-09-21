/*global require, describe, it, expect, beforeEach, jasmine, global */

describe('Context', function () {
	'use strict';
	var Context = require('../src/context'),
		underTest,
		processor,
		processorTwo;
	beforeEach(function () {
		global.defineStep = 'old-global-definestep';
		global.addMatchers = 'old-global-addmatchers';
		global.key = 'old-global-key';
		global.subkey =  'old-global-subkey';
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
	describe('exportToGlobal', function () {
		it('replaces defineStep and addMatchers in global', function () {
			underTest.exportToGlobal();
			expect(global.defineStep).toBe(underTest.defineStep);
			expect(global.addMatchers).toBe(underTest.addMatchers);
		});
	});
	describe('overrideGlobal', function () {
		it('replaces a named property in global', function () {
			underTest.overrideGlobal('subkey', 'new one');
			expect(global.subkey).toEqual('new one');
		});
		it('can be called multiple times for different properties', function () {
			underTest.overrideGlobal('subkey', 'new one');
			underTest.overrideGlobal('key', 'new key');
			expect(global.subkey).toEqual('new one');
			expect(global.key).toEqual('new key');
		});
		it('can be called multiple times for the same property', function () {
			underTest.overrideGlobal('subkey', 'new one');
			underTest.overrideGlobal('subkey', 'new key');
			expect(global.subkey).toEqual('new key');
		});
	});
	describe('resetGlobal', function () {
		it('reverts an override in global', function () {
			underTest.overrideGlobal('subkey', 'new one');
			underTest.resetGlobal();
			expect(global.subkey).toEqual('old-global-subkey');
		});
		it('reverts multiple properties', function () {
			underTest.overrideGlobal('subkey', 'new one');
			underTest.overrideGlobal('key', 'new key');
			underTest.resetGlobal();
			expect(global.subkey).toEqual('old-global-subkey');
			expect(global.key).toEqual('old-global-key');
		});
		it('reverts correctly even if the same property reset several times', function () {
			underTest.overrideGlobal('subkey', 'new one');
			underTest.overrideGlobal('subkey', 'new new one');
			underTest.resetGlobal();
			expect(global.subkey).toEqual('old-global-subkey');
		});
		it('reverts an export to global', function () {
			underTest.exportToGlobal();
			underTest.resetGlobal();
			expect(global.defineStep).toEqual('old-global-definestep');
			expect(global.addMatchers).toBe('old-global-addmatchers');
		});
	});

	describe('defineStep', function () {

		it('adds a processor function for a regular expression', function () {
			var executor;
			underTest.defineStep(/Who is (.*)/, processor);
			executor = underTest.getStepDefinitionForLine('Who is Mike');
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
		it('can be called multiple times for sub-matched regex searches', function () {
			var first, second;
			underTest.defineStep(/guest/gi, processor);

			first = underTest.getStepDefinitionForLine('guest001');
			second = underTest.getStepDefinitionForLine('guest001');
			expect(first).toEqual(second);
		});
		it('retrieves a step matching the line by regex', function () {
			var executor;
			underTest.defineStep(/Who is (.*)/, processor);
			underTest.defineStep(/Who was (.*)/, processorTwo);

			executor = underTest.getStepDefinitionForLine('Who was Mike');
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
