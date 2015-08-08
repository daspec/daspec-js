/*global describe, beforeEach, jasmine, it, expect, require */

describe('CompositeResultFormatter', function () {
	'use strict';
	var MarkdownResultFormatter = require('../src/markdown-result-formatter'),
		CompositeResultFormatter = require('../src/composite-result-formatter'),
		underTest, first, second, firstTable, secondTable,
		functionNames  = function (obj) {
			var result = [], prop;
			for (prop in obj) {
				if (typeof obj[prop] == 'function') {
					result.push(prop);
				}
			}
			return result;
		},
		template = new MarkdownResultFormatter(),
		/* formattedResults is markdown specific; the others are tested separately */
		nonGeneric = function (fname) {
			var nonGenericFuncs = ['tableResultBlock', 'appendResultBlock', 'formattedResults'];
			return nonGenericFuncs.indexOf(fname) < 0;
		},
		formatterFunctions = functionNames(template),
		tableFunctions = functionNames(template.tableResultBlock());
	beforeEach(function () {
		first = jasmine.createSpyObj('resultFormatter', formatterFunctions);
		firstTable = jasmine.createSpyObj('table formatter', tableFunctions);
		first.tableResultBlock.and.returnValue(firstTable);
		second = jasmine.createSpyObj('resultFormatter', formatterFunctions);
		secondTable = jasmine.createSpyObj('table formatter', tableFunctions);
		second.tableResultBlock.and.returnValue(secondTable);
		underTest = new CompositeResultFormatter();
		underTest.add(first);
		underTest.add(second);
	});
	formatterFunctions.filter(nonGeneric).forEach(function (fname) {
		it('propagates calls to ' + fname, function () {
			underTest[fname]('a', 'b', 'c');
			expect(first[fname]).toHaveBeenCalledWith('a', 'b', 'c');
			expect(second[fname]).toHaveBeenCalledWith('a', 'b', 'c');
		});
	});

	describe('table handling', function () {
		var tableFormatter;
		beforeEach(function () {
			tableFormatter = underTest.tableResultBlock();
		});
		tableFunctions.filter(nonGeneric).forEach(function (fname) {
			it('propagates calls to ' + fname, function () {
				tableFormatter[fname]('a', 'b', 'c');
				expect(firstTable[fname]).toHaveBeenCalledWith('a', 'b', 'c');
				expect(secondTable[fname]).toHaveBeenCalledWith('a', 'b', 'c');
			});
		});
		it('returns the table to the object it created', function () {
			underTest.appendResultBlock(tableFormatter);
			expect(first.appendResultBlock).toHaveBeenCalledWith(firstTable);
			expect(second.appendResultBlock).toHaveBeenCalledWith(secondTable);
		});
	});


});
