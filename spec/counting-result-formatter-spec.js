/*global describe, it, require, beforeEach, expect, jasmine*/

describe('CountingResultFormatter', function () {
	'use strict';
	var CountingResultFormatter = require('../src/counting-result-formatter'),
		observable = require('../src/observable'),
		Assertion = require('../src/assertion'),
		runner,
		underTest,
		dispatch = function (eventName, arg) {
			runner.dispatchEvent(eventName, arg);
		};
	beforeEach(function () {
		runner = observable({});
		underTest = new CountingResultFormatter(runner);
	});
	describe('current counts', function () {
		it('returns the counts from the ongoing execution', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 1, failed: 0, error: 0, skipped: 0}));
		});
		it('appends counts from multiple steps into current', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			dispatch('stepResult', {
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 2, passed: 1, failed: 1, error: 0, skipped: 0}));
		});
		it('clears out the counts with a change of spec', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			dispatch('specEnded');
			dispatch('specStarted');
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 0, skipped: 0}));
		});
		it('appends to a new one after a change of spec', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			dispatch('specEnded');
			dispatch('specStarted');
			dispatch('stepResult', {
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 0, failed: 1, error: 0, skipped: 0}));
		});
		it('does not clear immediately with specEnded', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			dispatch('specEnded');
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 1, failed: 0, error: 0, skipped: 0}));

		});
	});
	describe('total counts', function () {
		it('empty during an execution', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			expect(underTest.total).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 0, skipped: 0}));
		});
		it('appends current counts with specEnded', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			dispatch('specEnded');
			expect(underTest.total).toEqual(jasmine.objectContaining({executed: 1, passed: 1, failed: 0, error: 0, skipped: 0}));
		});
		it('appends over multiple examples', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			dispatch('specEnded');
			dispatch('specStarted');
			dispatch('stepResult', {
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			dispatch('specEnded');
			expect(underTest.total).toEqual(jasmine.objectContaining({executed: 2, passed: 1, failed: 1, error: 0, skipped: 0}));
		});
	});
	describe('stepResult', function () {
		it('adds to passed/executed all passed assertions', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 1, failed: 0, error: 0, skipped: 0}));
		});
		it('counts assertions, not steps', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true), new Assertion('b', 'b', true)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 2, passed: 2, failed: 0, error: 0, skipped: 0}));
		});
		it('counts failed asertions as failed', function () {
			dispatch('stepResult', {
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 0, failed: 1, error: 0, skipped: 0}));
		});
		it('does not increment counts for step results without assertions (setup steps)', function () {
			dispatch('stepResult', {
				stepText:'This will just be copied',
				assertions: [],
				matcher: /This will just be copied/
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 0, skipped: 0}));
		});
		it('reports exception in counts', function () {
			dispatch('stepResult', {
				stepText:'This will just be crossed',
				assertions: [],
				matcher: /This will just be crossed/,
				exception: 'Some exception'
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 1, skipped: 0}));
		});
	});
	describe('skippedLine', function () {
		it('reports in skipped counts', function () {
			dispatch('skippedLine', 'sline');
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 0, skipped: 1}));
		});
	});
});
