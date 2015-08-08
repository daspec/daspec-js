/*global describe, it, require, beforeEach, expect*/

describe('MarkdownResultFormatter', function () {
	'use strict';
	var MarkdownResultFormatter = require('../src/markdown-result-formatter'),
		Assertion = require('../src/assertion'),
		underTest;
	beforeEach(function () {
		underTest = new MarkdownResultFormatter();
	});
	describe('formattedResults', function () {
		it('returns the current result buffer, appending the execution summary to the top as a blockquote', function () {
			underTest.nonAssertionLine('hello there');
			underTest.nonAssertionLine('second line');
			expect(underTest.formattedResults()).toEqual('> **In da spec:** Nada\n\nhello there\nsecond line');
		});
	});
	describe('stepResult', function () {
		it('appends the execution result and adds to passed/executed all passed assertions', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true)]
			});
			expect(underTest.formattedResults()).toEqual('> **In da spec:** executed: 1, passed: 1\n\n**This will pass**');
		});
		it('counts assertions, not steps', function () {
			underTest.stepResult({
				stepText:'This will pass',
				assertions: [new Assertion('a', 'a', true), new Assertion('b', 'b', true)]
			});
			expect(underTest.formattedResults()).toEqual('> **In da spec:** executed: 2, passed: 2\n\n**This will pass**');
		});
		it('counts failed asertions as failed', function () {
			underTest.stepResult({
				stepText:'This will fail',
				assertions: [new Assertion('a', 'a', false)]
			});
			expect(underTest.formattedResults()).toEqual('> **In da spec:** executed: 1, failed: 1\n\n**~~This will fail~~**');
		});
		it('does not increment counts for step results without assertions (setup steps)', function () {

			underTest.stepResult({
				stepText:'This will just be copied',
				assertions: [],
				matcher: /This will just be copied/
			});
			expect(underTest.formattedResults()).toEqual('> **In da spec:** Nada\n\nThis will just be copied');
		});
	});
	describe('skippedLine', function () {
		it('copies the line and reports in skipped counts', function () {
			underTest.skippedLine('sline');
			expect(underTest.formattedResults()).toEqual('> **In da spec:** skipped: 1\n\nsline');
		});
	});

	describe('tableResultBlock', function () {
		it('should return a new formatter for tableResultBlocks', function () {
			var tableBlock1 = underTest.tableResultBlock(),
				tableBlock2 = underTest.tableResultBlock();
			expect(tableBlock1).not.toBe(tableBlock2);
		});
		describe('TableResultBlock', function () {
			var tableResultBlock;
			beforeEach(function () {
				tableResultBlock = underTest.tableResultBlock();
			});
			describe('stepResult', function () {
				it('should create a markdown formatted table lines', function () {
					tableResultBlock.stepResult({
						stepText:'|a|b|',
						assertions: [new Assertion('a', 'a', true)]
					});
					tableResultBlock.stepResult({
						stepText:'|c|d|',
						assertions: [new Assertion('a', 'a', true)]
					});
					var results = tableResultBlock.formattedResults();
					expect(results).toEqual([
						'| **a** | **b** |',
						'| **c** | **d** |'
					]);
				});
				it('should record  assertion results in counts', function () {
					tableResultBlock.stepResult({
						assertions: [
							new Assertion('a', 'a', true),
							new Assertion('a', 'b', false)
						]
					});
					expect(tableResultBlock.counts.executed).toEqual(2);
					expect(tableResultBlock.counts.passed).toEqual(1);
					expect(tableResultBlock.counts.failed).toEqual(1);
				});
				it('should record assertion exceptions in counts', function () {
					tableResultBlock.stepResult({
						exception: 'foo',
						assertions: [
							new Assertion('a', 'b', false)
						]
					});
					expect(tableResultBlock.counts.error).toEqual(1);
				});
			});
			describe('nonAssertionLine', function () {
				it('should create a markdown formatted table lines', function () {
					tableResultBlock.nonAssertionLine('| a | b |');
					tableResultBlock.nonAssertionLine('| c | d |');
					var results = tableResultBlock.formattedResults();
					expect(results).toEqual([
						'| a | b |',
						'| c | d |'
					]);
				});
				it('should record not assertion results in counts', function () {
					tableResultBlock.nonAssertionLine('|a|b|');
					tableResultBlock.nonAssertionLine('|c|d|');
					expect(tableResultBlock.counts.skipped).toEqual(0);
				});
			});
			describe('table column width formatting', function () {
				it('should size the columns to fit the longest data in all the data rows', function () {
					tableResultBlock.nonAssertionLine('| aaaaaaaaaaaaaa| b |');
					tableResultBlock.nonAssertionLine('| c |**d**|');
					var results = tableResultBlock.formattedResults();
					expect(results).toEqual([
						'| aaaaaaaaaaaaaa | b     |',
						'| c              | **d** |'
					]);
				});
			});
		});
	});

});
