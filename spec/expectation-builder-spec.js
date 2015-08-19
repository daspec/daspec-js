/*global describe, expect, it, beforeEach, require */
describe('ExpectationBuilder', function () {
	'use strict';
	var underTest,
		ExpectationBuilder = require ('../src/expectation-builder'),
		Expect = require ('../src/expect');
	beforeEach(function () {
		underTest = new ExpectationBuilder(['manager', 20000, 'manager']);
	});
	describe('expect', function () {
		it('starts a new expectation chain', function () {
			expect(underTest.expect(1000) instanceof Expect).toBeTruthy();
		});
	});
	describe('adding extension matchers', function () {
		it('allows extension methods to be added to the expect', function () {
			underTest = new ExpectationBuilder(['manager', 20000, 'manager'], {
				toFoo: function () {
					this.addAssertion(this.actual === 'foo', 'foo');
					return this;
				},
				toBar: function () {
					this.addAssertion(this.actual === 'bar', 'bar');
					return this;
				}
			});
			var result = underTest.expect('bar').toFoo().toBar();
			expect(result.assertions.length).toEqual(2);
			expect(result.assertions[0]).toEqual({
				passed: false,
				expected: 'foo',
				actual: 'bar'
			});
			expect(result.assertions[1]).toEqual({
				passed: true,
				expected: 'bar',
				actual: 'bar'
			});
		});
	});
	describe('position setting', function () {
		it('allows positions to be set using atPosition', function () {
			expect(underTest.expect(1000).toEqual('xmanager').atPosition(1).lastAssertion.position).toBe(1);
		});

	});
	describe('getAssertions', function () {
		it('returns a list of all assertions executed by the expect method chains', function () {
			underTest.expect('manager').toEqual('manager').atPosition(0);
			underTest.expect('yoyo').toEqual('foo');
			underTest.expect(10000).toEqual(20000);

			expect(underTest.getAssertions()).toEqual([
				{passed: true, expected: 'manager', actual: 'manager', position: 0},
				{passed: false, expected: 'foo', actual: 'yoyo'},
				{passed: false, expected: 20000, actual: 10000, position: 1}
			]);
		});
		it('automatically sets positions for assertions for unique values', function () {
			underTest.expect(1000).toEqual(20000);
			expect(underTest.getAssertions()[0].position).toBe(1);
		});
		it('automatically sets position to the right-most for non-unique values', function () {
			underTest.expect(1000).toEqual('manager');
			expect(underTest.getAssertions()[0].position).toBe(2);
		});
		it('only sets positions if the expectation does not already force it', function () {
			underTest.expect(1000).toEqual('manager').atPosition(0);
			expect(underTest.getAssertions()[0].position).toBe(0);
		});
		it('does not set positions for expected values not matching any parameters', function () {
			underTest.expect(1000).toEqual('xmanager');
			expect(underTest.getAssertions()[0].position).toBeUndefined();
		});
		it('clears positions out of range', function () {
			underTest.expect(1000).toEqual('xmanager').atPosition(8);
			underTest.expect(1000).toEqual('xmanager').atPosition(-1);
			expect(underTest.getAssertions()[0].position).toBeUndefined();
			expect(underTest.getAssertions()[1].position).toBeUndefined();
		});
		it('clears positions out of range, even if they can be automatically detected', function () {
			underTest.expect(1000).toEqual('manager').atPosition(8);
			expect(underTest.getAssertions()[0].position).toBeUndefined();
		});

	});
});

