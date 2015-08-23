/*global describe, jasmine, require, beforeEach, it, expect*/
describe('Expect', function () {
	'use strict';
	var Expect = require ('../src/expect'),
		underTest;
	beforeEach(function () {
		underTest = new Expect(2000);
	});
	describe('equality assertions', function () {
		it('should compare numbers', function () {
			expect(underTest.toEqual(20000).lastAssertion).toEqual({ expected: 20000, actual: 2000, passed: false });
			expect(underTest.toEqual(2000).lastAssertion).toEqual({ expected: 2000, actual: 2000, passed: true });
		});
		it('should compare objects', function () {
			expect(new Expect({'a': 1, 'b': 2}).toEqual({'b': 2, 'a': 1}).lastAssertion.passed).toBeTruthy();
			expect(new Expect({'a': 1, 'b': 2}).toEqual({'b': 2, 'a': 2}).lastAssertion.passed).toBeFalsy();
			expect(new Expect({'a': 1}).toEqual({'b': 2, 'a': 1}).lastAssertion.passed).toBeFalsy();
			expect(new Expect({'a': 1, 'b': 2}).toEqual({'b': 2}).lastAssertion.passed).toBeFalsy();
			expect(new Expect({'a': 1, 'b': {'c': 3}}).toEqual({'b': {'c': 3}, 'a': 1}).lastAssertion.passed).toBeTruthy();
			expect(new Expect({'a': 1, 'b': {'c': 3}}).toEqual({'b': {'c': 4}, 'a': 1}).lastAssertion.passed).toBeFalsy();
		});
	});
	describe('truthfulness assertions', function () {
		it('should allow for truthy assertions', function () {
			expect(new Expect(true).toBeTruthy().lastAssertion).toEqual({actual:true, passed: true });
			expect(new Expect('a').toBeTruthy().lastAssertion).toEqual({actual:'a', passed: true });
			expect(new Expect(1).toBeTruthy().lastAssertion).toEqual({actual:1, passed: true });
		});
		it('should allow for falsy assertions', function () {
			expect(new Expect(false).toBeFalsy().lastAssertion).toEqual({actual:false, passed: true });
			expect(new Expect('').toBeFalsy().lastAssertion).toEqual({actual:'', passed: true });
			expect(new Expect(0).toBeFalsy().lastAssertion).toEqual({actual:0, passed: true });
			expect(new Expect().toBeFalsy().lastAssertion).toEqual({actual:undefined, passed: true });
		});
		it('should allow for absolutely true assertions', function () {
			expect(new Expect(true).toBeTrue().lastAssertion).toEqual({actual:true, passed: true });
			expect(new Expect('a').toBeTrue().lastAssertion).toEqual({actual:'a', passed: false });
		});
		it('should allow for absolutely false assertions', function () {
			expect(new Expect(false).toBeFalse().lastAssertion).toEqual({actual:false, passed: true });
			expect(new Expect().toBeFalse().lastAssertion).toEqual({actual:undefined, passed: false });
		});
	});
	describe('range assertions', function () {
		it('should allow toBeGreaterThan assertion', function () {
			expect(underTest.toBeGreaterThan(1999.999).lastAssertion).toEqual({expected: 1999.999, actual: 2000, passed: true });
			expect(underTest.toBeGreaterThan(2000.001).lastAssertion).toEqual({expected:2000.001, actual: 2000, passed: false });
			expect(underTest.toBeGreaterThan(2000).lastAssertion).toEqual({expected:2000, actual: 2000, passed: false});
			expect(new Expect(undefined).toBeGreaterThan(2000).lastAssertion).toEqual({expected:2000, actual: undefined, passed: false});
		});
		it('should allow toBeGreaterThanOrEqual assertion', function () {
			expect(underTest.toBeGreaterThanOrEqual(1999.999).lastAssertion).toEqual({expected: 1999.999, actual: 2000, passed: true });
			expect(underTest.toBeGreaterThanOrEqual(2000.001).lastAssertion).toEqual({expected:2000.001, actual: 2000, passed: false });
			expect(underTest.toBeGreaterThanOrEqual(2000).lastAssertion).toEqual({expected:2000, actual: 2000, passed: true });
		});
		it('should allow toBeLessThan assertion', function () {
			expect(underTest.toBeLessThan(1999.999).lastAssertion).toEqual({expected: 1999.999, actual: 2000, passed: false });
			expect(underTest.toBeLessThan(2000.001).lastAssertion).toEqual({expected:2000.001, actual: 2000, passed: true });
			expect(underTest.toBeLessThan(2000).lastAssertion).toEqual({expected:2000, actual: 2000, passed: false });
		});
		it('should allow toBeLessThanOrEqual assertion', function () {
			expect(underTest.toBeLessThanOrEqual(1999.999).lastAssertion).toEqual({expected: 1999.999, actual: 2000, passed: false });
			expect(underTest.toBeLessThanOrEqual(2000.001).lastAssertion).toEqual({expected:2000.001, actual: 2000, passed: true });
			expect(underTest.toBeLessThanOrEqual(2000).lastAssertion).toEqual({expected:2000, actual: 2000, passed: true });
		});
		describe('toBeBetween', function () {
			it('should pass both when actual is within range', function () {
				expect(underTest.toBeBetween(1999.999, 2000.001).assertions).toEqual([
					{expected: 1999.999, actual: 2000, passed: true },
					{expected: 2000.001, actual: 2000, passed: true }
					]);
			});
			it('should fail toBeBetween assertion if actual is outside of range, preserving the passed assertion', function () {
				expect(underTest.toBeBetween(2500, 2000.001).assertions).toEqual([
					{expected: 2000.001, actual: 2000, passed: false },
					{expected: 2500, actual: 2000, passed: true }
					]);
			});
			it('should fail when the actual is undefined', function () {
				expect(new Expect(undefined).toBeBetween(2500, 2000.001).assertions).toEqual([
					{expected: 2000.001, actual: undefined, passed: false },
					{expected: 2500, actual: undefined, passed: false }
					]);
			});
			it('should allow toBeBetween assertion with arguments reversed', function () {
				expect(underTest.toBeBetween(2000.001, 1999.999).assertions).toEqual([
					{expected: 1999.999, actual: 2000, passed: true },
					{expected: 2000.001, actual: 2000, passed: true }
					]);
			});
			it('allows actual to be equal to the range delimiters for toBeBetween assertion', function () {
				expect(underTest.toBeBetween(1999.999, 2000).assertions).toEqual([
					{expected: 1999.999, actual: 2000, passed: true },
					{expected: 2000, actual: 2000, passed: true }
					]);
				expect(underTest.toBeBetween(2000, 2000.001).assertions.slice(2)).toEqual([
					{expected: 2000, actual: 2000, passed: true },
					{expected: 2000.001, actual: 2000, passed: true }
					]);
				expect(underTest.toBeBetween(2000, 2000).assertions.slice(4)).toEqual([
					{expected: 2000, actual: 2000, passed: true },
					{expected: 2000, actual: 2000, passed: true }
					]);
			});
		});
		describe('toBeWithin', function () {
			it('should pass both when actual is within range', function () {
				expect(underTest.toBeWithin(1999.999, 2000.001).assertions).toEqual([
					{expected: 1999.999, actual: 2000, passed: true },
					{expected: 2000.001, actual: 2000, passed: true }
					]);
			});
			it('should allow toBeWithin assertion with arguments reversed', function () {
				expect(underTest.toBeWithin(2000.001, 1999.999).assertions).toEqual([
					{expected: 1999.999, actual: 2000, passed: true },
					{expected: 2000.001, actual: 2000, passed: true }
					]);
			});
			it('does not allow actual to be equal to the range delimiters for toBeBetween assertion', function () {
				expect(underTest.toBeWithin(1999.999, 2000).assertions).toEqual([
					{expected: 1999.999, actual: 2000, passed: true },
					{expected: 2000, actual: 2000, passed: false }
					]);
				expect(underTest.toBeWithin(2000, 2000.001).assertions.slice(2)).toEqual([
					{expected: 2000, actual: 2000, passed: false },
					{expected: 2000.001, actual: 2000, passed: true }
					]);
				expect(underTest.toBeWithin(2000, 2000).assertions.slice(4)).toEqual([
					{expected: 2000, actual: 2000, passed: false },
					{expected: 2000, actual: 2000, passed: false }
					]);
			});

		});
	});
	describe('.not', function () {
		it('should negate assertions', function () {
			expect(new Expect(false).not.toBeTruthy().lastAssertion).toEqual(jasmine.objectContaining({ passed: true }));
		});
		it('should negate itself', function () {
			expect(new Expect(true).not.not.toBeTruthy().lastAssertion).toEqual(jasmine.objectContaining({ passed: true }));
		});
	});
	it('uses .atPosition to set positions', function () {
		expect(underTest.toEqual(2).atPosition(3).lastAssertion).toEqual(jasmine.objectContaining({ expected: 2, position: 3, actual: 2000, passed: false }));
	});
});
