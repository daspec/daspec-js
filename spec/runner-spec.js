/*global describe, it, expect, jasmine, beforeEach, require, spyOn */
describe('Runner', function () {
	'use strict';
	var Runner = require('../src/runner'),
		Assertion = require('../src/assertion'),
		runner,
		stepFunc = function (context) {
			context.defineStep(/this will pass/, function () {
				this.assertEquals('expected', 'expected');
			});
			context.defineStep(/this has no assertions/, function () {
			});
			context.defineStep(/this will fail/, function () {
				this.assertEquals('expected', 'not expected');
			});
			context.defineStep(/equal numbers (\d*) = (\d*)/, function (first, second) {
				this.assertEquals(second, first, 1);
			});
			context.defineStep(/table of ([a-z]*)/, function (title, table) {
				this.assertUnorderedTableEquals(table, [{name: 'yum'}]);
			});
			context.defineStep(/list of ([a-z]*)/, function (title, list) {
				this.assertSetEquals(list.items, [title]);
			});
			context.defineStep(/throw ([a-z]*)/, function (msg) {
				throw msg;
			});
			context.defineStep(/\| number one \| number two \|/, function (first, second) {
				this.assertEquals(second, first, 1);
			});
		},
		config,
		callSequence,
		listeners = {},
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
		runner = new Runner(stepFunc, config);
		['specStarted', 'specEnded', 'nonAssertionLine', 'skippedLine', 'stepResult', 'tableStarted', 'tableEnded', 'suiteEnded'].forEach(buildListener);
		spyOn(runner, 'execute').and.callThrough();
	});
	describe('executeSuite', function () {
		describe('executes specs defined in the suite', function () {
			describe('uses the content for each spec', function () {
				it('when provided as a string', function () {
					runner.executeSuite([
						{name:'spec1', content:'content1'},
						{name:'spec2', content:'content2'}
					]);
					expect(runner.execute).toHaveBeenCalledWith('content1', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('content2', 'spec2');
				});
				it('when provided as a function', function () {
					runner.executeSuite([
						{name:'spec1', content: function () {
							return 'content1';
						}},
						{name:'spec2', content:function () {
							return 'content2';
						}}
					]);
					expect(runner.execute).toHaveBeenCalledWith('content1', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('content2', 'spec2');
				});
				it('when provided as a mixture of functions, strings', function () {
					runner.executeSuite([
						{name:'spec1', content: 'content1'},
						{name:'spec2', content:function () {
							return 'content2';
						}}
					]);
					expect(runner.execute).toHaveBeenCalledWith('content1', 'spec1');
					expect(runner.execute).toHaveBeenCalledWith('content2', 'spec2');
				});
			});
		});
		describe('terminates suite execution before all specs have been executed', function () {
			beforeEach(function () {
				config.failFast = true;
			});
			it('when a spec has failures and config has failFast:true', function () {
				runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this will fail'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
				expect(runner.execute).toHaveBeenCalledWith('this will fail', 'spec2');
				expect(runner.execute.calls.count()).toBe(2);
			});
			it('when a spec has skipped lines and config has failFast:true and does not have allowSkipped:true', function () {
				runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this will be skipped'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
				expect(runner.execute).toHaveBeenCalledWith('this will be skipped', 'spec2');
				expect(runner.execute.calls.count()).toBe(2);

			});
			it('when a spec has errors and config has failFast:true', function () {
				runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this will pass\nthis will throw foo'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
				expect(runner.execute).toHaveBeenCalledWith('this will pass\nthis will throw foo', 'spec2');
				expect(runner.execute.calls.count()).toBe(2);

			});
			it('when a specs does not contain any assertions and config has failFast:true', function () {
				runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this has no assertions'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
				expect(runner.execute).toHaveBeenCalledWith('this has no assertions', 'spec2');
				expect(runner.execute.calls.count()).toBe(2);
			});

		});
		describe('does not terminate suite execution before all specs have been executed', function () {
			it('when a spec has failures and config has failFast:false', function () {
				runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this will fail'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
				expect(runner.execute).toHaveBeenCalledWith('this will fail', 'spec2');
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec3');
			});
			it('when a spec has skipped lines and config has failFast:false and does not have allowSkipped:true', function () {
				runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this will be skipped'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
				expect(runner.execute).toHaveBeenCalledWith('this will be skipped', 'spec2');
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec3');

			});
			it('when a spec has errors and config has failFast:false', function () {
				runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this will pass\nthis will throw foo'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
				expect(runner.execute).toHaveBeenCalledWith('this will pass\nthis will throw foo', 'spec2');
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec3');

			});
			it('when a specs does not contain any assertions and config has failFast:false', function () {
				runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this has no assertions'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec1');
				expect(runner.execute).toHaveBeenCalledWith('this has no assertions', 'spec2');
				expect(runner.execute).toHaveBeenCalledWith('this will pass', 'spec3');
			});
		});
		describe('returns a boolean value of', function () {
			it('true if all specs passed', function () {
				var result = runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(result).toBeTruthy();
			});
			it('true if some specs contained skipped assertions when config does have allowSkipped:true', function () {
				config.allowSkipped = true;
				var result = runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this will be skipped'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(result).toBeTruthy();
			});
			it('false if any specs contained failed assertions', function () {
				var result = runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this will fail'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(result).toBeFalsy();
			});
			it('false if any specs contained errors', function () {
				var result = runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this will pass\nthis will throw foo'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(result).toBeFalsy();
			});
			it('false if any specs contained skipped assertions when config does not have allowSkipped:true', function () {
				var result = runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this will be skipped'},
					{name:'spec3', content:'this will pass'}
				]);
				expect(result).toBeFalsy();

			});
			it('false no specs contain any assertions', function () {
				var result = runner.executeSuite([
					{name:'spec1', content:'this has no assertions'},
					{name:'spec2', content:'this has no assertions'},
					{name:'spec3', content:'this has no assertions'}
				]);
				expect(result).toBeFalsy();

			});
		});
		describe('sends suite events', function () {
			it('sends a suiteEnded event with total counts', function () {
				runner.executeSuite([
					{name:'spec1', content:'this will pass'},
					{name:'spec2', content:'this has no assertions'},
					{name:'spec3', content:'this will be skipped'},
					{name:'spec4', content:'this will fail'},
					{name:'spec5', content:'this will throw foo'},
					{name:'spec6', content:'this will pass'}
				]);
				expect(listeners.suiteEnded).toHaveBeenCalledWith(jasmine.objectContaining({executed: 3, passed: 2, failed: 1, error: 1, skipped: 1}));
			});
		});
	});
	describe('events dispatched during processing', function () {

		it('nonAssertionLine event for things that are not even expected to match to steps', function () {
			runner.execute('# header 1\n# header 2', 'thespecname');
			expect(listeners.nonAssertionLine).toHaveBeenCalledWith('# header 1', 1, 'thespecname');
			expect(listeners.nonAssertionLine).toHaveBeenCalledWith('# header 2', 2, 'thespecname');
		});
		it('skippedLine event for things that are expected to match steps, but no matching steps found', function () {
			runner.execute('text line 1 non matching steps\ntext line 2 non matching steps', 'thespecname');
			expect(listeners.skippedLine).toHaveBeenCalledWith('text line 1 non matching steps', 1, 'thespecname');
			expect(listeners.skippedLine).toHaveBeenCalledWith('text line 2 non matching steps', 2, 'thespecname');
		});
		describe('stepResult', function () {
			it('event for steps without an attachment', function () {
				runner.execute('this will pass -- whole line', 'thespecname');
				expect(listeners.stepResult).toHaveBeenCalledWith(
					{
						matcher: /this will pass/,
						stepText: 'this will pass -- whole line',
						attachment: false,
						assertions: [new Assertion('expected', 'expected', true)]
					},
					1,
					'thespecname'
				);
			});
			it('receives a simple call with an attachment', function () {
				runner.execute('list of yum\n* yum', 'thespecname');
				expect(listeners.stepResult).toHaveBeenCalledWith({
						matcher: /list of ([a-z]*)/,
						stepText: 'list of yum',
						attachment: { type: 'list', ordered: false, items: ['yum'], symbol: '* ' },
						assertions: [
							new Assertion(
								['yum'],
								{ matches: true, missing: [  ], additional: [  ], matching: ['yum'] },
								true
							)
						]
					},
					1,
					'thespecname'
				);
			});
		});
		describe('table handling', function () {
			it('send a tableStarted event before for the first table item line', function () {
				runner.execute('| number one | number two |\n|------|\n| 4 | 4 |', 'thespecname');
				expect(listeners.tableStarted).toHaveBeenCalledWith(1, 'thespecname');
			});
			it('send a tableEnded event before for the first table item line', function () {
				runner.execute('#comment 1\n| number one | number two |\n| 4 | 4 |\n| 5 | 5 |\n#comment 2', 'thespecname');
				expect(listeners.tableEnded).toHaveBeenCalledWith(4, 'thespecname');
			});
			it('sends nonAssertionLine events for  table headers and separators', function () {
				runner.execute('#comment 1\n| number one | number two |\n|------|\n| 4 | 4 |\n|--|--|\n| 5 | 5 |', 'thespecname');
				expect(listeners.nonAssertionLine).toHaveBeenCalledWith('#comment 1', 1, 'thespecname');
				expect(listeners.nonAssertionLine).toHaveBeenCalledWith('| number one | number two |', 2, 'thespecname');
				expect(listeners.nonAssertionLine).toHaveBeenCalledWith('|------|', 3, 'thespecname');
				expect(listeners.nonAssertionLine).toHaveBeenCalledWith('|--|--|', 5, 'thespecname');
			});
			it('sends skippedLine event if the first table item does not match any steps', function () {
				runner.execute('| number three | number four |', 'thespecname');
				expect(listeners.skippedLine).toHaveBeenCalledWith('| number three | number four |', 1, 'thespecname');
			});
			it('should send table events in the correct order', function () {
				runner.execute('#comment 1\n| number one | number two |\n| 4 | 4 |\n| 5 | 5 |\n\n| number one | number two |\n|--|--|\n| 5 | 5 |', 'thespecname');
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
			});

			it('the tableResultBlock result receives table data rows as stepResult', function () {
				runner.execute('#comment 1\n| number one | number two |\n|------|\n| 4 | 4 |\n|--|--|\n| 4 | 5 |', 'thespecname');
				expect(listeners.stepResult.calls.allArgs()).toEqual([
					[{ matcher: /\|(.*)\|(.*)\|/, stepText: '| 4 | 4 |', assertions: [new Assertion('4', '4', true, 1)]}, 4, 'thespecname'],
					[{ matcher: /\|(.*)\|(.*)\|/, stepText: '| 4 | 5 |', assertions: [new Assertion('5', '4', false, 1)]}, 6, 'thespecname']
				]);
			});
		});
		it('sends specStarted and specEnded events', function () {
			runner.execute('# header 1\n> comment', 'some-file-name');
			expect(listeners.specStarted).toHaveBeenCalledWith('some-file-name');
			expect(listeners.specEnded).toHaveBeenCalledWith('some-file-name', jasmine.any(Object));
			expect(callSequence).toEqual([
				'specStarted',
				'nonAssertionLine',
				'nonAssertionLine',
				'specEnded'
			]);
		});
		it('specEnded should return the counts for the spec', function () {
			runner.execute('this will pass\nthis will fail', 'specname');
			expect(listeners.specEnded).toHaveBeenCalledWith('specname', jasmine.objectContaining({executed: 2, passed: 1, failed: 1, error: 0, skipped: 0}));
		});

	});
});
