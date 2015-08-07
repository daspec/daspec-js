/*global require, describe, it, expect, beforeEach */
describe('regex util', function () {
	'use strict';
	var RegexUtil = require('../src/regex-util'),
		underTest;
	beforeEach(function () {
		underTest = new RegexUtil();
	});
	describe('replaceMatchGroup', function () {
		it('replaces a substring corresponding to a match group by index', function () {
			expect(underTest.replaceMatchGroup(
				'Simple arithmetic: 22 plus 222 is 2 and 43',
				/Simple arithmetic: (\d*) plus (\d*) is (\d*) and (\d*)/,
				[{index:2, value:'XXX'}]
				)).toEqual('Simple arithmetic: 22 plus 222 is XXX and 43');
		});
		it('replaces multiple substrings corresponding to match groups by index', function () {
			expect(underTest.replaceMatchGroup(
				'Simple arithmetic: 22 plus 222 is 2 and 43',
				/Simple arithmetic: (\d*) plus (\d*) is (\d*) and (\d*)/,
				[{index:2, value:'XXX'}, {index:3, value: 'YYY'}]
				)).toEqual('Simple arithmetic: 22 plus 222 is XXX and YYY');
		});
		it('deals with non-capturing regexes', function () {
			expect(underTest.replaceMatchGroup(
				'arithmetic: 22 plus 222 is 2 and 43',
				/[a-z]*: (\d*) plus (\d*) is (\d*) and (\d*)/,
				[{index:2, value:'XXX'}, {index:3, value: 'YYY'}]
				)).toEqual('arithmetic: 22 plus 222 is XXX and YYY');
		});
		it('deals with initial and trailing parts of the string', function () {
			expect(underTest.replaceMatchGroup(
				'initial arithmetic: 22 plus 222 is 2 and 43 trailing',
				/[a-z]*: (\d*) plus (\d*) is (\d*) and (\d*)/,
				[{index:2, value:'XXX'}, {index:3, value: 'YYY'}]
				)).toEqual('initial arithmetic: 22 plus 222 is XXX and YYY trailing');
		});
		it('works when regex has escape characters', function () {
			expect(underTest.replaceMatchGroup(
				'|Simple arithmetic|22 plus 222 is 2 and 43|',
				/\|Simple arithmetic\|(\d*) plus (\d*) is (\d*) and (\d*)\|/,
				[{index:2, value:'XXX'}, {index:3, value: 'YYY'}]
				)).toEqual('|Simple arithmetic|22 plus 222 is XXX and YYY|');
		});
		it('works when regex has double-escape characters', function () {
			expect(underTest.replaceMatchGroup(
				'|Simple arithmetic\\22 plus 222 is 2 and 43|',
				/\|Simple arithmetic\\(\d*) plus (\d*) is (\d*) and (\d*)\|/,
				[{index:2, value:'XXX'}, {index:3, value: 'YYY'}]
				)).toEqual('|Simple arithmetic\\22 plus 222 is XXX and YYY|');
		});
		it('works with capture groups at start', function () {
			expect(underTest.replaceMatchGroup(
				'hello there how are you',
				/([a-z]*) [a-z]* ([a-z]*) [a-z ]*/,
				[{index:1, value:'XXX'}, {index:0, value: 'YYY'}]
				)).toEqual('YYY there XXX are you');
		});
		it('works with capture groups at end', function () {
			expect(underTest.replaceMatchGroup(
				'hello there how are you',
				/[a-z]* ([a-z]*) [a-z]* ([a-z ]*)/,
				[{index:1, value:'XXX'}, {index:0, value: 'YYY'}]
				)).toEqual('hello YYY how XXX');
		});
		it('works with escaped brackets', function () {
			expect(underTest.replaceMatchGroup(
				'hello the(re how are you',
				/[a-z]* ([a-z\(]*) [a-z]* ([a-z ]*)/,
				[{index:1, value:'XXX'}, {index:0, value: 'YYY'}]
				)).toEqual('hello YYY how XXX');
		});
		it('ignores overrides for negative or out of range indexes', function () {
			expect(underTest.replaceMatchGroup(
				'hello there how are you',
				/[a-z]* ([a-z]*) [a-z]* ([a-z ]*)/,
				[{index:2, value:'XXX'}, {index:0, value: 'YYY'}, {index: -1, value: '888'}]
				)).toEqual('hello YYY how are you');
		});
		it('works with no capture groups', function () {
			expect(underTest.replaceMatchGroup(
				'hello there how are you',
				/[a-z]* [a-z]* [a-z]* [a-z ]*/,
				[{index:2, value:'XXX'}, {index:0, value: 'YYY'}, {index: -1, value: '888'}]
				)).toEqual('hello there how are you');

		});
	});
	describe('lineItemContent', function () {
		it('ignores lines that are not list items', function () {
			expect(underTest.lineItemContent('**SHOUT**')).toBe('**SHOUT**');
		});
		it('removes list symbols from items', function () {
			expect(underTest.lineItemContent('* **SHOUT**')).toBe('**SHOUT**');
			expect(underTest.lineItemContent(' * **SHOUT**')).toBe('**SHOUT**');
			expect(underTest.lineItemContent(' - **SHOUT**')).toBe('**SHOUT**');
			expect(underTest.lineItemContent('-  **SHOUT**')).toBe('**SHOUT**');
		});
		it('trims trailing spaces from the right', function () {
			expect(underTest.lineItemContent('* with space ')).toBe('with space');
			expect(underTest.lineItemContent('* with tab\t')).toBe('with tab');
		});
	});
	describe('getListSymbol', function () {
		it('returns empty string for non list items', function () {
			expect(underTest.getListSymbol('**SHOUT**')).toBe('');
		});
		it('returns everything before the actual content for list items', function () {
			expect(underTest.getListSymbol('* **SHOUT**')).toBe('* ');
			expect(underTest.getListSymbol(' * **SHOUT**')).toBe(' * ');
			expect(underTest.getListSymbol(' - **SHOUT**')).toBe(' - ');
			expect(underTest.getListSymbol('-  **SHOUT**')).toBe('-  ');
			expect(underTest.getListSymbol('121. number')).toBe('121. ');
			expect(underTest.getListSymbol(' 121.\t\tnumber')).toBe(' 121.\t\t');
		});
	});
	describe('isTableItem', function () {
		it('recognises lines that start with a |', function () {
			expect(underTest.isTableItem('|one|')).toBeTruthy();
			expect(underTest.isTableItem('  |one|')).toBeTruthy();
		});
		it('ignores lines that have a pipe in the middle but not at the start', function () {
			expect(underTest.isTableItem('o|ne|')).toBeFalsy();
			expect(underTest.isTableItem('>|ne|')).toBeFalsy();
			expect(underTest.isTableItem('#|ne|')).toBeFalsy();
		});
		it('ignores lines that have code spacing at start', function () {
			expect(underTest.isTableItem('    |ne|')).toBeFalsy();
			expect(underTest.isTableItem('\t|ne|')).toBeFalsy();
			expect(underTest.isTableItem(' \t|ne|')).toBeFalsy();
			expect(underTest.isTableItem('\t |ne|')).toBeFalsy();
			expect(underTest.isTableItem('       |ne|')).toBeFalsy();
		});
	});
	describe('isTableDataRow', function () {
		it('recognises a data row of table', function () {
			expect(underTest.isTableDataRow('|one|')).toBeTruthy();
		});
		it('does not recognise table header divider', function () {
			expect(underTest.isTableDataRow('|---|')).toBeFalsy();
		});
	});
	describe('regexForTableDataRow', function () {
		it('should create regex with matching groups for each column unstripped', function () {
			var result = underTest.regexForTableDataRow(3),
				match = ' | a | b | \tc   | '.match(result);
			expect(match.slice(1)).toEqual([' a ', ' b ', ' \tc   ']);
		});
		it('should return false is 0 (or less) or undefined cell count supplied', function () {
			expect(underTest.regexForTableDataRow(0)).toBeFalsy();
			expect(underTest.regexForTableDataRow(-1)).toBeFalsy();
			expect(underTest.regexForTableDataRow()).toBeFalsy();
		});
	});
	describe('isTableHeaderDivider', function () {
		it('recognises lines with pipes separated by dashes', function () {
			expect(underTest.isTableHeaderDivider('|---|')).toBeTruthy();
			expect(underTest.isTableHeaderDivider('|---|-|--------|')).toBeTruthy();
			expect(underTest.isTableHeaderDivider('  |---|')).toBeTruthy();
			expect(underTest.isTableHeaderDivider('|===|')).toBeTruthy();
			expect(underTest.isTableHeaderDivider('|===|=|========|')).toBeTruthy();
			expect(underTest.isTableHeaderDivider('  |===|')).toBeTruthy();
			expect(underTest.isTableHeaderDivider('|---|-|=====|')).toBeTruthy();
		});
		it('recognises spaces inside the row', function () {
			expect(underTest.isTableHeaderDivider('| --- | - | ===== |')).toBeTruthy();
		});
		it('ignores lines that have anything apart from dashes or equals', function () {
			expect(underTest.isTableHeaderDivider('|---|-|===A==|')).toBeFalsy();
		});
		it('ignores lines that have a pipe in the middle but not at the start', function () {
			expect(underTest.isTableHeaderDivider('o|--|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('--|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('o|==|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('>|--|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('#|==|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('>|==|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('#|==|')).toBeFalsy();
		});
		it('ignores lines that have code spacing at start', function () {
			expect(underTest.isTableHeaderDivider('    |--|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('\t|--|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider(' \t|--|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('\t |--|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('       |--|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('    |==|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('\t|==|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider(' \t|==|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('\t |==|')).toBeFalsy();
			expect(underTest.isTableHeaderDivider('       |==|')).toBeFalsy();
		});
	});
	describe('isCodeItem', function () {
		it('recognises at least four starting spaces, or tabs, as code', function () {
			expect(underTest.isCodeItem('    n')).toBeTruthy();
			expect(underTest.isCodeItem('\tn')).toBeTruthy();
			expect(underTest.isCodeItem(' \tn')).toBeTruthy();
			expect(underTest.isCodeItem('\t n')).toBeTruthy();
			expect(underTest.isCodeItem('       n')).toBeTruthy();
		});
		it('ignores lines that have non-code spacing at start', function () {
			expect(underTest.isCodeItem('   n')).toBeFalsy();
			expect(underTest.isCodeItem('#   n')).toBeFalsy();
		});
		it('ignores blank/space only lines', function () {
			expect(underTest.isCodeItem('   ')).toBeFalsy();
			expect(underTest.isCodeItem('')).toBeFalsy();
			expect(underTest.isCodeItem('    ')).toBeFalsy();
			expect(underTest.isCodeItem('\t')).toBeFalsy();
			expect(underTest.isCodeItem(' \t')).toBeFalsy();
			expect(underTest.isCodeItem('\t ')).toBeFalsy();
			expect(underTest.isCodeItem('       ')).toBeFalsy();
		});
	});
	describe('isListItem', function () {
		it('ignores horizontal lines', function () {
			expect(underTest.isListItem('****')).toBeFalsy();
			expect(underTest.isListItem('* * * *')).toBeFalsy();
			expect(underTest.isListItem('---')).toBeFalsy();
			expect(underTest.isListItem('===')).toBeFalsy();
		});
		it('ignores lines that have bold formatting', function () {
			expect(underTest.isListItem('**SHOUT**')).toBeFalsy();
			expect(underTest.isListItem('** SHOUT **')).toBeFalsy();
			expect(underTest.isListItem('* SHOUT *')).toBeFalsy();
		});
		it('recognises lines starting with dashes and stars as lists', function () {
			expect(underTest.isListItem('* **SHOUT**')).toBeTruthy();
			expect(underTest.isListItem('*\t**SHOUT**')).toBeTruthy();
			expect(underTest.isListItem(' * **SHOUT**')).toBeTruthy();
			expect(underTest.isListItem(' - **SHOUT**')).toBeTruthy();
			expect(underTest.isListItem('- **SHOUT**')).toBeTruthy();
			expect(underTest.isListItem('-\t**SHOUT**')).toBeTruthy();

		});
		it('recognises lines starting with numbers followed by a space as lists', function () {
			expect(underTest.isListItem('1. something')).toBeTruthy();
			expect(underTest.isListItem('  22222. something else')).toBeTruthy();
			expect(underTest.isListItem('2.\tsomething else')).toBeTruthy();
			expect(underTest.isListItem('2.something else')).toBeFalsy();
		});
	});
	describe('isEmpty', function () {
		it('returns false if a string is empty or can be trimmed to empty', function () {
			expect(underTest.isEmpty('')).toBeTruthy();
			expect(underTest.isEmpty('\t\t')).toBeTruthy();
			expect(underTest.isEmpty(' \t')).toBeTruthy();
			expect(underTest.isEmpty('     ')).toBeTruthy();
		});
		it('returns false if a string contains at least one non space character', function () {
			expect(underTest.isEmpty('X')).toBeFalsy();
			expect(underTest.isEmpty('\tX\t')).toBeFalsy();
			expect(underTest.isEmpty(' \tX')).toBeFalsy();
			expect(underTest.isEmpty('     X')).toBeFalsy();
		});
	});
});
