/*global describe, it, require, beforeEach, expect*/

describe('MarkdownResultFormatter', function () {
	'use strict';
	var MarkdownResultFormatter = require('../src/markdown-result-formatter'),
		observable = require('../src/observable'),
		underTest,
		runner,
		globalConfig,
		dispatch = function (eventName, arg) {
			runner.dispatchEvent(eventName, arg);
		};
	beforeEach(function () {
		globalConfig = {allowSkipped: true, markdown: {skippedLineIndicator: 'foo'}};
		runner = observable({});
		underTest = new MarkdownResultFormatter(runner, globalConfig);
	});
	describe('formattedResults', function () {
		it('returns the current result buffer, appending the execution summary to the top as a blockquote', function () {
			dispatch('nonAssertionLine', 'hello there');
			dispatch('nonAssertionLine', 'second line');
			expect(underTest.formattedResults()).toEqual('hello there\nsecond line');
		});

		it('should preserve empty non assertion lines', function () {
			dispatch('nonAssertionLine', 'hello there', 1, 'foo');
			dispatch('nonAssertionLine',  '', 2, 'foo');
			dispatch('nonAssertionLine', 'second line', 3, 'foo');
			expect(underTest.formattedResults()).toEqual('hello there\n\nsecond line');
		});

	});
	describe('stepResult', function () {
		it('appends the execution result and adds to passed/executed all passed assertions', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [{expected: 'a', actual:'a', passed: true}]
			});

			expect(underTest.formattedResults()).toEqual('**This will pass**');
		});
	});
	describe('skippedLine', function () {
		describe('prepends a default indicator', function () {
			it('when no config at all supplied', function () {
				underTest = new MarkdownResultFormatter(runner);
				dispatch('skippedLine', 'sline');
				expect(underTest.formattedResults()).toEqual('`skipped` sline');
			});

			it('when no markdown config supplied and skipped lines are not allowed', function () {
				delete globalConfig.markdown;
				globalConfig.allowSkipped = false;
				underTest = new MarkdownResultFormatter(runner, globalConfig);
				dispatch('skippedLine', 'sline');
				expect(underTest.formattedResults()).toEqual('`skipped` sline');
			});
			it('when markdown config is supplied but does not define a skipped line indicator and skipped lines are not allowed', function () {
				delete globalConfig.markdown.skippedLineIndicator;
				globalConfig.allowSkipped = false;
				underTest = new MarkdownResultFormatter(runner, globalConfig);
				dispatch('skippedLine', 'sline');
				expect(underTest.formattedResults()).toEqual('`skipped` sline');
			});
		});
		it('prepends a configured indicator when markdown skipped line indicator is supplied and skipped lines are not allowed', function () {
			globalConfig.allowSkipped = false;
			underTest = new MarkdownResultFormatter(runner, globalConfig);
			dispatch('skippedLine', 'sline');
			expect(underTest.formattedResults()).toEqual('foo sline');
		});
		describe('does not prepend a skipped line indicator', function () {
			it('when skipped lines are allowed and no markdown config is supplied', function () {
				delete globalConfig.markdown;
				underTest = new MarkdownResultFormatter(runner, globalConfig);
				dispatch('skippedLine', 'sline');
				expect(underTest.formattedResults()).toEqual('sline');
			});
			it('when skipped lines are allowed and markdown config is supplied which does not define an indicator', function () {
				delete globalConfig.markdown.skippedLineIndicator;
				underTest = new MarkdownResultFormatter(runner, globalConfig);
				dispatch('skippedLine', 'sline');
				expect(underTest.formattedResults()).toEqual('sline');
			});
			it('when skipped lines are allowed and markdown config is supplied which does define an indicator', function () {
				dispatch('skippedLine', 'sline');
				expect(underTest.formattedResults()).toEqual('sline');
			});
		});
		it('copies the attached lines', function () {
			//TODO
		});
	});
	describe('table formatting', function () {
		beforeEach(function () {
			dispatch('tableStarted');
		});
		describe('stepResult', function () {
			it('should create a markdown formatted table lines', function () {
				dispatch('stepResult', {
					stepText:'|a|b|',
					assertions: [{expected: 'a', actual: 'a', passed: true}]
				});
				dispatch('stepResult', {
					stepText:'|c|d|',
					assertions: [{expected: 'a', actual: 'a', passed: true}]
				});
				dispatch('tableEnded');
				var results = underTest.formattedResults();
				expect(results).toEqual([
					'| **a** | **b** |',
					'| **c** | **d** |'
				].join('\n'));
			});
		});
		describe('nonAssertionLine', function () {
			it('should create a markdown formatted table lines', function () {
				dispatch('nonAssertionLine', '| a | b |');
				dispatch('nonAssertionLine', '| c | d |');
				dispatch('tableEnded');
				var results = underTest.formattedResults();
				expect(results).toEqual([
					'| a | b |',
					'| c | d |'
				].join('\n'));
			});
		});
		describe('table column width formatting', function () {
			it('should size the columns to fit the longest data in all the data rows', function () {
				dispatch('nonAssertionLine', '| aaaaaaaaaaaaaa| b |');
				dispatch('nonAssertionLine', '| c |**d**|');
				dispatch('tableEnded');
				var results = underTest.formattedResults();
				expect(results).toEqual([
					'| aaaaaaaaaaaaaa | b     |',
					'| c              | **d** |'
				].join('\n'));
			});
		});
	});
	describe('batching example results', function () {

		it('specEnded appends multiple lines together, and adds counts', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [{expected: 'a', actual: 'a', passed: true}]
			});
			dispatch('stepResult', {
				stepText:'This will fail',
				assertions: [{expected:'a', actual: 'a', passed: false}]
			});
			dispatch('specEnded');
			expect(underTest.formattedResults()).toEqual('> **In da spec:** executed: 2, passed: 1, failed: 1\n\n**This will pass**\n**~~This will fail~~**');
		});
		it('specStarted clears out the buffer', function () {
			dispatch('stepResult', {
				stepText:'This will pass',
				assertions: [{expected: 'a', actual: 'a', passed: true}]
			});
			dispatch('specEnded');
			dispatch('specStarted');
			dispatch('stepResult', {
				stepText:'This will fail',
				assertions: [{expected: 'a', actual: 'a', passed: false}]
			});
			dispatch('specEnded');
			expect(underTest.formattedResults()).toEqual('> **In da spec:** executed: 1, failed: 1\n\n**~~This will fail~~**');
		});
	});
});
