/*global describe, it, expect, require, beforeEach, jasmine, Promise, setTimeout*/

describe('StepExecutor', function () {
	'use strict';
	var StepExecutor = require('../src/step-executor'),
		SpecContext = require('../src/context'),
		tableMatcher = require('../src/matchers/table'),
		listMatcher = require('../src/matchers/list'),
		underTest,
		regexMatcher,
		processFunction,
		specContext;
	beforeEach(function () {
		regexMatcher = /this is a (.*)/;
		specContext = new SpecContext();
		specContext.addMatchers(tableMatcher);
		specContext.addMatchers(listMatcher);
		processFunction = jasmine.createSpy('processFunction');
		underTest = new StepExecutor({matcher: regexMatcher, processFunction: processFunction}, specContext);
	});
	describe('executeTableRow', function () {
		it('should pass the the cell values to the process function as parameters - ' +
			' ignoring the regex matcher because it works on table headers', function () {
			underTest.executeTableRow('|one|two|three|');
			expect(processFunction).toHaveBeenCalledWith('one', 'two', 'three');
		});
	});
	describe('execute', function () {
		var equalNumberStep;
		beforeEach(function () {
			equalNumberStep = new StepExecutor({matcher: /equal numbers (\d*) = (\d*)/, processFunction: function (first, second) {
				expect(first).toEqual(second);
			}}, specContext);
		});
		it('should return result for non-positional, without an assertion index', function (done) {
			underTest = new StepExecutor({matcher: /this will pass/, processFunction: function () {
				expect('expected').toEqual('expected');
			}}, specContext);
			underTest.execute('this will pass -- whole line', false).then(
				function (result) {
					expect(result).toEqual(
						jasmine.objectContaining({
							matcher: /this will pass/,
							stepText: 'this will pass -- whole line',
							attachment: false,
							assertions: [{expected: 'expected', actual: 'expected', passed: true}]
						})
					);
				}
			).then(done, done.fail);
		});

		it('should return result for positional passing, with an index', function (done) {
			equalNumberStep.execute('equal numbers 5 = 5', false).then(
				function (result) {
					expect(result).toEqual(jasmine.objectContaining({
						matcher: /equal numbers (\d*) = (\d*)/,
						stepText: 'equal numbers 5 = 5',
						attachment: false,
						assertions: [{expected: 5, actual: 5, passed: true, position: 1}]
					}));
				}
			).then(done, done.fail);
		});
		it('should return result for non-positional failure', function (done) {
			underTest = new StepExecutor({matcher: /this will fail/, processFunction: function () {
				expect('not expected').toEqual('expected');
			}}, specContext);
			underTest.execute('this will fail -- whole line', false).then(
				function (result) {
					expect(result).toEqual(jasmine.objectContaining({
						matcher: /this will fail/,
						stepText: 'this will fail -- whole line',
						attachment: false,
						assertions: [{expected: 'expected', actual: 'not expected', passed: false}]
					}));
					done();
				}
			).then(done, done.fail);
		});
		it('should return result for positional failures, with an index', function (done) {
			equalNumberStep.execute('equal numbers 5 = 6', false).then(
				function (result) {
					expect(result).toEqual(jasmine.objectContaining({
						matcher: /equal numbers (\d*) = (\d*)/,
						stepText: 'equal numbers 5 = 6',
						attachment: false,
						assertions: [{expected: 6, actual: 5, passed: false, position: 1}]
					}));
					done();
				}
			).then(done, done.fail);
		});
		it('should return result for exceptions, with an exception in the step result', function (done) {
			underTest = new StepExecutor({matcher: /throw ([a-z]*)/, processFunction: function (msg) {
				throw msg;
			}}, specContext);
			underTest.execute('throw blabla', false).then (
				function (result) {
					expect(result).toEqual(jasmine.objectContaining({
						matcher: /throw ([a-z]*)/,
						stepText: 'throw blabla',
						attachment: false,
						assertions: [],
						exception: 'blabla'
					}));
				}
			).then(done, done.fail);
		});
		describe('promise handling', function () {
			var hasResolved, hasRejected;
			beforeEach(function () {
				underTest = new StepExecutor({matcher: /promise ([a-z]*)/,
					processFunction: function (msg) {
						var promise = new Promise(
								function (resolve, reject) {
									setTimeout(function () {
										if (msg === 'fail') {
											hasRejected = true;
											reject('total fail');
										} else {
											expect('expected').toEqual(msg);
											hasResolved = true;
											resolve();
										}
									}, 10);
								});
						return promise;
					}
				}, specContext);
			});
			it('should block on promise', function (done) {
				underTest.execute('promise expected', false).then (
					function (result) {
						expect(hasResolved).toBeTruthy();
						expect(result).toEqual(jasmine.objectContaining({
							matcher: /promise ([a-z]*)/,
							stepText: 'promise expected',
							attachment: false,
							assertions: [{position: 0, expected: 'expected', actual: 'expected', passed: true}]
						}));
					}
				).then(done, done.fail);
			});
			it('should record failed expectations in promise', function (done) {
				underTest.execute('promise unexpected', false).then (
					function (result) {
						expect(hasResolved).toBeTruthy();
						expect(result).toEqual(jasmine.objectContaining({
							matcher: /promise ([a-z]*)/,
							stepText: 'promise unexpected',
							attachment: false,
							assertions: [{position: 0, expected: 'unexpected', actual: 'expected', passed: false}]
						}));
					}
				).then(done, done.fail);
			});
			it('should fail on promise rejection', function (done) {
				underTest.execute('promise fail', false).then (
					function (result) {
						expect(hasResolved).toBeTruthy();
						expect(result).toEqual(jasmine.objectContaining({
							matcher: /promise ([a-z]*)/,
							stepText: 'promise fail',
							attachment: false,
							assertions: [],
							exception: 'total fail'
						}));
					}
				).then(done, done.fail);
			});
		});
		it('receives a simple call for a list attachment', function (done) {
			var expected;
			underTest = new StepExecutor({matcher: /list of ([a-z]*)/, processFunction: function (title, list) {
				expect([title]).toEqualSet(list);
			}}, specContext);
			expected = { type: 'list', ordered: false, items: ['yum'], symbol: '* ' };
			underTest.execute('list of yum', expected).then(
				function (result) {
					expect(result).toEqual(jasmine.objectContaining({
						matcher: /list of ([a-z]*)/,
						stepText: 'list of yum',
						attachment: expected,
						assertions: [
							{
								expected: expected,
								actual: ['yum'],
								detail: { matches: true, missing: [  ], additional: [  ], matching: ['yum'] },
								passed: true,
								position: 1
							}
						]
					}));
				}
			).then(done, done.fail);
		});
		it('receives a simple call for a table attachment', function (done) {
			var expected;
			underTest = new StepExecutor({matcher: /table of ([a-z]*)/, processFunction: function (title, table) {
				expect([{name: 'yum'}]).toEqualUnorderedTable(table);
			}}, specContext);
			expected = { type: 'table', titles: ['name'], items: [['yum']]};
			underTest.execute('table of yum', expected).then(
				function (result) {
					expect(result).toEqual(jasmine.objectContaining({
						matcher: /table of ([a-z]*)/,
						stepText: 'table of yum',
						attachment: expected,
						assertions: [
							{
								expected: expected,
								detail: { matches: true, missing: [], additional: [], matching: [['yum']]},
								actual: [{name: 'yum'}],
								passed: true,
								position: 1
							}
						]
					}));
				}
			).then(done, done.fail);
		});

	});
});
