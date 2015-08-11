/*global describe, it, expect, jasmine, beforeEach, require */
describe('Runner - Result Formatter Interface', function () {
	'use strict';
	var Runner = require('../src/runner'),
		Assertion = require('../src/assertion'),
		runner,
		stepFunc = function (context) {
			context.defineStep(/this will pass/, function () {
				this.assertEquals('expected', 'expected');
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
		};
	beforeEach(function () {
		var tableFormatter = jasmine.createSpyObj('table formatter', ['stepResult', 'nonAssertionLine']),
			resultFormatter = jasmine.createSpyObj('resultFormatter', ['exampleStarted', 'exampleFinished', 'stepResult', 'nonAssertionLine', 'appendResultBlock', 'skippedLine', 'tableResultBlock']);
		resultFormatter.tableResultBlock.and.returnValue(tableFormatter);
		runner = new Runner(stepFunc, resultFormatter);
	});
	describe('events dispatched during processing', function () {
		var callSequence,
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
			['specStarted', 'specEnded', 'nonAssertionLine', 'skippedLine', 'stepResult', 'tableStarted', 'tableEnded'].forEach(buildListener);
		});

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
			expect(listeners.specEnded).toHaveBeenCalledWith('some-file-name');
			expect(callSequence).toEqual([
				'specStarted',
				'nonAssertionLine',
				'nonAssertionLine',
				'specEnded'
			]);
		});
	});
});
