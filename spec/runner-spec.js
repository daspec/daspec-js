/*global describe, it, expect, jasmine, beforeEach, require, spyOn */
describe('Runner', function () {
	'use strict';
	var Runner = require('../src/runner'),
		runner,
		stepFunc = function (context) {
			context.defineStep(/this will pass/, function () {
				expect('expected').toEqual('expected');
			});
			context.defineStep(/this has no assertions/, function () {
			});
			context.defineStep(/this will fail/, function () {
				expect('expected').toEqual('not expected');
			});
			context.defineStep(/equal numbers (\d*) = (\d*)/, function (first, second) {
				expect(second).toEqual(first);
			});
			context.defineStep(/table of ([a-z]*)/, function (title, table) {
				expect([{name: 'yum'}]).toEqualUnorderedTable(table);
			});
			context.defineStep(/list of ([a-z]*)/, function (title, list) {
				expect([title]).toEqualSet(list);
			});
			context.defineStep(/throw ([a-z]*)/, function (msg) {
				throw msg;
			});
			context.defineStep(/\| number one \| number two \|/, function (first, second) {
				expect(first).toEqual(second).atPosition(1);
			});
		},
		config,
		callSequence,
		listeners,
		buildListener = function (eventName) {
			var listener = jasmine.createSpy(eventName).and.callFake(function () {
				callSequence.push(eventName);
			});
			runner.addEventListener(eventName, listener);
			listeners[eventName] = listener;
		};
	beforeEach(function () {
		callSequence = [];
		config = {};
		listeners = {};
		runner = new Runner(stepFunc, config);
		['specStarted', 'specEnded', 'nonAssertionLine', 'skippedLine', 'stepResult', 'tableStarted', 'tableEnded', 'suiteEnded'].forEach(buildListener);
		spyOn(runner, 'execute').and.callThrough();
	});
	describe('executeSuite', function () {
		describe('executes specs defined in the suite', function () {
			describe('uses the content for each spec', function () {
				it('when provided as a string', function (done) {
					runner.executeSuite([
						{name: 'spec1', content: 'content1'},
						{name: 'spec2', content: 'content2'}
					]).then(function () {
						expect(runner.execute).toHaveBeenCalledWith('content1', 'spec1');
						expect(runner.execute).toHaveBeenCalledWith('content2', 'spec2');
					}).then(done, done.fail);
				});
				it('when provided as a function', function (done) {
					runner.executeSuite([
						{name: 'spec1', content: function () {
							return 'content1';
						}},
						{name: 'spec2', content: function () {
							return 'content2';
						}}
					]).then(function () {
						expect(runner.execute).toHaveBeenCalledWith('content1', 'spec1');
						expect(runner.execute).toHaveBeenCalledWith('content2', 'spec2');
					}).then(done, done.fail);
				});
				it('when provided as a mixture of functions, strings', function (done) {
					runner.executeSuite([
						{name: 'spec1', content: 'content1'},
						{name: 'spec2', content: function () {
							return 'content2';
						}}
					]).then(function () {
						expect(runner.execute).toHaveBeenCalledWith('content1', 'spec1');
						expect(runner.execute).toHaveBeenCalledWith('content2', 'spec2');
					}).then(done, done.fail);
				});
			});
		});
		describe('terminates suite execution before all specs have been executed', function () {
			beforeEach(function () {
				config.failFast = true;
			});
			it('when a spec has failures and config has failFast:true', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this will fail'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function () {
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('this will fail', 'spec2');
					expect(runner.execute.calls.count()).toBe(2);
				}).then(done, done.fail);
			});
			it('when a spec has skipped lines and config has failFast:true and does not have allowSkipped:true', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this will be skipped'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function () {
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('this will be skipped', 'spec2');
					expect(runner.execute.calls.count()).toBe(2);
				}).then(done, done.fail);
			});
			it('when a spec has errors and config has failFast:true', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this will pass\nthis will throw foo'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function () {
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('this will pass\nthis will throw foo', 'spec2');
					expect(runner.execute.calls.count()).toBe(2);
				}).then(done, done.fail);
			});
			it('when a specs does not contain any assertions and config has failFast:true', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this has no assertions'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function () {
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('this has no assertions', 'spec2');
					expect(runner.execute.calls.count()).toBe(2);
				}).then(done, done.fail);
			});

		});
		describe('does not terminate suite execution before all specs have been executed', function () {
			it('when a spec has failures and config has failFast:false', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this will fail'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function () {
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('this will fail', 'spec2');
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec3');
				}).then(done, done.fail);
			});
			it('when a spec has skipped lines and config has failFast:false and does not have allowSkipped:true', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this will be skipped'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function () {
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('this will be skipped', 'spec2');
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec3');
				}).then(done, done.fail);
			});
			it('when a spec has errors and config has failFast:false', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this will pass\nthis will throw foo'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function () {
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('this will pass\nthis will throw foo', 'spec2');
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec3');
				}).then(done, done.fail);
			});
			it('when a specs does not contain any assertions and config has failFast:false', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this has no assertions'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function () {
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('this has no assertions', 'spec2');
					expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec3');
				}).then(done, done.fail);
			});
		});
		describe('promise outcome', function () {
			it('true if all specs passed', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function (result) {
					expect(result).toBeTruthy();
				}).then(done, done.fail);
			});
			it('true if some specs contained skipped assertions when config does have allowSkipped:true', function (done) {
				config.allowSkipped = true;
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this will be skipped'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function (result) {
					expect(result).toBeTruthy();
				}).then(done, done.fail);
			});
			it('false if any specs contained failed assertions', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this will fail'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function (result) {
					expect(result).toBeFalsy();
				}).then(done, done.fail);
			});
			it('false if any specs contained errors', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this will pass\nthis will throw foo'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function (result) {
					expect(result).toBeFalsy();
				}).then(done, done.fail);
			});
			it('false if any specs contained skipped assertions when config does not have allowSkipped:true', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this will be skipped'},
					{name: 'spec3', content: 'this will pass'}
				]).then(function (result) {
					expect(result).toBeFalsy();
				}).then(done, done.fail);
			});
			it('false if no specs contain any assertions', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this has no assertions'},
					{name: 'spec2', content: 'this has no assertions'},
					{name: 'spec3', content: 'this has no assertions'}
				]).then(function (result) {
					expect(result).toBeFalsy();
				}).then(done, done.fail);
			});
		});
		describe('sends suite events', function () {
			it('sends a suiteEnded event with total counts', function (done) {
				runner.executeSuite([
					{name: 'spec1', content: 'this will pass'},
					{name: 'spec2', content: 'this has no assertions'},
					{name: 'spec3', content: 'this will be skipped'},
					{name: 'spec4', content: 'this will fail'},
					{name: 'spec5', content: 'this will throw foo'},
					{name: 'spec6', content: 'this will pass'}
				]).then(function () {
					expect(listeners.suiteEnded).toHaveBeenCalledWith(jasmine.objectContaining({executed: 3, passed: 2, failed: 1, error: 1, skipped: 1}));
				}).then(done, done.fail);
			});
		});
	});
	describe('events dispatched during processing', function () {

		it('nonAssertionLine event for things that are not even expected to match to steps', function (done) {
			runner.execute('# header 1\n# header 2', 'thespecname').then(function () {
				expect(listeners.nonAssertionLine).toHaveBeenCalledWith('# header 1', 1, 'thespecname');
				expect(listeners.nonAssertionLine).toHaveBeenCalledWith('# header 2', 2, 'thespecname');
			}).then(done, done.fail);
		});
		it('skippedLine event for things that are expected to match steps, but no matching steps found', function (done) {
			runner.execute('text line 1 non matching steps\ntext line 2 non matching steps\n|a|\n|b|', 'thespecname').then(function () {
				expect(listeners.skippedLine).toHaveBeenCalledWith('text line 1 non matching steps', 1, 'thespecname');
				expect(listeners.skippedLine).toHaveBeenCalledWith('text line 2 non matching steps', 2, 'thespecname');
				expect(listeners.nonAssertionLine).toHaveBeenCalledWith('|a|', 3, 'thespecname');
				expect(listeners.nonAssertionLine).toHaveBeenCalledWith('|b|', 4, 'thespecname');
			}).then(done, done.fail);
		});
		describe('stepResult', function () {
			it('event for steps without an attachment', function (done) {
				runner.execute('this will pass -- whole line', 'thespecname').then(function () {
					expect(listeners.stepResult).toHaveBeenCalledWith(
						jasmine.objectContaining({
							matcher: /this will pass/,
							stepText: 'this will pass -- whole line',
							attachment: false,
							assertions: [{expected: 'expected', actual: 'expected', passed: true}]
						}),
						1,
						'thespecname'
					);
				}).then(done, done.fail);
			});
			it('receives a simple call with an attachment', function (done) {
				var expected = { type: 'list', ordered: false, items: ['yum'], symbol: '* ' };
				runner.execute('list of yum\n\n* yum\n> comment', 'thespecname').then(function () {
					expect(listeners.stepResult).toHaveBeenCalledWith(jasmine.objectContaining({
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
						}),
						1,
						'thespecname'
					);
					expect(listeners.nonAssertionLine).toHaveBeenCalledWith('> comment', 4, 'thespecname');
				}).then(done, done.fail);
			});
		});
		describe('table handling', function () {
			it('send a tableStarted event before for the first table item line', function (done) {
				runner.execute('| number one | number two |\n|------|\n| 4 | 4 |', 'thespecname').then(function () {
					expect(listeners.tableStarted).toHaveBeenCalledWith(1, 'thespecname');
				}).then(done, done.fail);
			});
			it('send a tableEnded event before for the first table item line', function (done) {
				runner.execute('#comment 1\n| number one | number two |\n| 4 | 4 |\n| 5 | 5 |\n#comment 2', 'thespecname').then(function () {
					expect(listeners.tableEnded).toHaveBeenCalledWith(4, 'thespecname');
				}).then(done, done.fail);
			});
			it('sends nonAssertionLine events for  table headers and separators', function (done) {
				runner.execute('#comment 1\n| number one | number two |\n|------|\n| 4 | 4 |\n|--|--|\n| 5 | 5 |', 'thespecname').then(function () {
					expect(listeners.nonAssertionLine).toHaveBeenCalledWith('#comment 1', 1, 'thespecname');
					expect(listeners.nonAssertionLine).toHaveBeenCalledWith('| number one | number two |', 2, 'thespecname');
					expect(listeners.nonAssertionLine).toHaveBeenCalledWith('|------|', 3, 'thespecname');
					expect(listeners.nonAssertionLine).toHaveBeenCalledWith('|--|--|', 5, 'thespecname');
				}).then(done, done.fail);
			});
			it('sends skippedLine event if the first table item does not match any steps', function (done) {
				runner.execute('| number three | number four |', 'thespecname').then(function () {
					expect(listeners.skippedLine).toHaveBeenCalledWith('| number three | number four |', 1, 'thespecname');
				}).then(done, done.fail);
			});
			it('should send table events in the correct order', function (done) {
				runner.execute('#comment 1\n| number one | number two |\n| 4 | 4 |\n| 5 | 5 |\n\n| number one | number two |\n|--|--|\n| 5 | 5 |', 'thespecname').then(function () {
					expect(callSequence).toEqual([
						'specStarted',
						'nonAssertionLine',
						'tableStarted',
						'nonAssertionLine',
						'stepResult',
						'stepResult',
						'tableEnded',
						'nonAssertionLine',
						'tableStarted',
						'nonAssertionLine',
						'nonAssertionLine',
						'stepResult',
						'tableEnded',
						'specEnded'
					]);
				}).then(done, done.fail);
			});
			it('the tableResultBlock result receives table data rows as stepResult', function (done) {
				runner.execute('#comment 1\n| number one | number two |\n|------|\n| 4 | 4 |\n|--|--|\n| 4 | 5 |', 'thespecname').then(function () {
					expect(listeners.stepResult.calls.argsFor(0)).toEqual(
						[jasmine.objectContaining({ matcher: /\|(.*)\|(.*)\|/, stepText: '| 4 | 4 |', assertions: [
							{
								expected: 4,
								actual: 4,
								passed: true,
								position: 1
							}]}), 4, 'thespecname'
						]);
					expect(listeners.stepResult.calls.argsFor(1)).toEqual([
						jasmine.objectContaining(
							{
								matcher: /\|(.*)\|(.*)\|/,
								stepText: '| 4 | 5 |',
								assertions: [{expected: 5, actual: 4, passed: false, position: 1}]
							}),
						6,
						'thespecname'
					]);
				}).then(done, done.fail);
			});
		});
		it('sends specStarted and specEnded events', function (done) {
			runner.execute('# header 1\n> comment', 'some-file-name').then(function () {
				expect(listeners.specStarted).toHaveBeenCalledWith('some-file-name');
				expect(listeners.specEnded).toHaveBeenCalledWith('some-file-name', jasmine.any(Object));
				expect(callSequence).toEqual([
					'specStarted',
					'nonAssertionLine',
					'nonAssertionLine',
					'specEnded'
				]);
			}).then(done, done.fail);
		});
		it('specEnded should return the counts for the spec', function (done) {
			runner.execute('this will pass\nthis will fail', 'specname').then(function () {
				expect(listeners.specEnded).toHaveBeenCalledWith('specname', jasmine.objectContaining({executed: 2, passed: 1, failed: 1, error: 0, skipped: 0}));
			}).then(done, done.fail);
		});

	});
});
