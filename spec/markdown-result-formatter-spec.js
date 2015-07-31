/*global describe, it, require, beforeEach, expect*/

describe('MarkdownResultFormatter', function () {
	'use strict';
	var MarkdownResultFormatter = require('../src/markdown-result-formatter'),
		Assertion = require('../src/assertion'),
		underTest;
	beforeEach(function () {
		underTest = new MarkdownResultFormatter();
	});
	describe('stepResult', function () {

	});
	describe('nonAssertionLine', function () {

	});
	describe('skippedLine', function () {

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

				});
				it('should size the columns to fit the header if it is longer htan any data', function () {

				});
				it('should size the table header divider to match the colun widths required for the data and headers', function () {

				});
				it('should handle blank column headers', function () {

				});

				it('should handle multiple table dividers', function () {

				});
			});
		});
	});

});
