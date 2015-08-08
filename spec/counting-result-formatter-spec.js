/*global describe, it, require, beforeEach, expect, jasmine*/

describe('CountingResultFormatter', function () {
	'use strict';
	var CountingResultFormatter = require('../src/counting-result-formatter'),
		Assertion = require('../src/assertion'),
		underTest;
	beforeEach(function () {
		underTest = new CountingResultFormatter();
	});
	describe('current counts', function () {
		it('returns the counts from the ongoing execution', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 1, failed: 0, error: 0, skipped: 0}));
		});
		it('appends counts from multiple steps into current', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			underTest.stepResult({
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 2, passed: 1, failed: 1, error: 0, skipped: 0}));
		});
		it('clears out the counts with exampleStarted', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			underTest.exampleStarted();
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 0, skipped: 0}));
		});
		it('appends to a new one after exampleStarted', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			underTest.exampleStarted();
			underTest.stepResult({
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 0, failed: 1, error: 0, skipped: 0}));
		});
		it('does not clear immediately with exampleFinished', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			underTest.exampleFinished();
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 1, failed: 0, error: 0, skipped: 0}));

		});
	});
	describe('total counts', function () {
		it('empty during an execution', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			expect(underTest.total).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 0, skipped: 0}));
		});
		it('appends current counts with exampleFinished', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			underTest.exampleFinished();
			expect(underTest.total).toEqual(jasmine.objectContaining({executed: 1, passed: 1, failed: 0, error: 0, skipped: 0}));
		});
		it('appends over multiple examples', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			underTest.exampleFinished();
			underTest.exampleStarted();
			underTest.stepResult({
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			underTest.exampleFinished();
			expect(underTest.total).toEqual(jasmine.objectContaining({executed: 2, passed: 1, failed: 1, error: 0, skipped: 0}));
		});
	});
	describe('stepResult', function () {
		it('adds to passed/executed all passed assertions', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 1, failed: 0, error: 0, skipped: 0}));
		});
		it('counts assertions, not steps', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true), new Assertion('b', 'b', true)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 2, passed: 2, failed: 0, error: 0, skipped: 0}));
		});
		it('counts failed asertions as failed', function () {
			underTest.stepResult({
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 0, failed: 1, error: 0, skipped: 0}));
		});
		it('does not increment counts for step results without assertions (setup steps)', function () {
			underTest.stepResult({
				stepText:'This will just be copied',
				assertions: [],
				matcher: /This will just be copied/
			});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 0, skipped: 0}));
		});
		it('reports exception in counts', function () {
			underTest.stepResult({
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
			underTest.skippedLine('sline');
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 0, skipped: 1}));
		});
	});
	describe('appendResultBlock', function () {
		it('does nothing -- handled by table formatter block method stepResult', function () {
			underTest.appendResultBlock({current: {executed: 5, passed: 3, failed: 2}});
			expect(underTest.current).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 0, skipped: 0}));
		});
	});

	describe('TableResultBlock', function () {
		var tableResultBlock;
		beforeEach(function () {
			tableResultBlock = underTest.tableResultBlock();
		});
		describe('stepResult', function () {
			it('should record assertion results in current counts', function () {
				tableResultBlock.stepResult({
					assertions: [
						new Assertion('a', 'a', true),
						new Assertion('a', 'b', false)
					]
				});
				expect(underTest.current).toEqual(jasmine.objectContaining({executed: 2, passed: 1, failed: 1, error: 0, skipped: 0}));
			});
			it('should record assertion exceptions in counts', function () {
				tableResultBlock.stepResult({
					exception: 'foo',
					assertions: [
						new Assertion('a', 'b', false)
					]
				});
				expect(underTest.current).toEqual(jasmine.objectContaining({executed: 1, passed: 0, failed: 1, error: 1, skipped: 0}));
			});
		});
		describe('nonAssertionLine', function () {
			it('should not modify counts', function () {
				tableResultBlock.nonAssertionLine('| a | b |');
				tableResultBlock.nonAssertionLine('| c | d |');
				expect(underTest.current).toEqual(jasmine.objectContaining({executed: 0, passed: 0, failed: 0, error: 0, skipped: 0}));
			});
		});
	});
	describe('events', function () {
		var spies = {};
		beforeEach(function () {
			['started', 'exampleFinished', 'closed'].forEach(function (eventName) {
				spies[eventName] = jasmine.createSpy(eventName);
				underTest.addEventListener(eventName, spies[eventName]);
			});
		});
		it('dispatches started when the first example starts', function () {
			underTest.exampleStarted();
			expect(spies.started).toHaveBeenCalled();
		});
		it('does not dispatch started when subsequent examples start', function () {
			underTest.exampleStarted();
			underTest.exampleFinished();
			underTest.exampleStarted();
			expect(spies.started.calls.count()).toEqual(1);
		});
		it('dispatches exampleFinished with the current counts when an example completes', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			underTest.stepResult({
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			underTest.exampleFinished('some-name');
			expect(spies.exampleFinished).toHaveBeenCalledWith('some-name', jasmine.objectContaining({executed: 2, passed: 1, failed: 1, error: 0, skipped: 0}));
		});
		it('dispatches the current, not the total counts, with exampleFinished', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			underTest.exampleFinished('some-name');
			spies.exampleFinished.calls.reset();
			underTest.exampleStarted('some-other-name');
			underTest.stepResult({
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			underTest.exampleFinished('some-other-name');
			expect(spies.exampleFinished).toHaveBeenCalledWith('some-other-name', jasmine.objectContaining({executed: 1, passed: 0, failed: 1, error: 0, skipped: 0}));
		});
		it('dispatches closed with the total count when the result formatter is closed', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			underTest.exampleFinished('some-name');
			underTest.exampleStarted('some-other-name');
			underTest.stepResult({
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			underTest.exampleFinished('some-other-name');
			underTest.close();
			expect(spies.closed).toHaveBeenCalledWith(jasmine.objectContaining({executed: 2, passed: 1, failed: 1, error: 0, skipped: 0}));
		});
	});
});
