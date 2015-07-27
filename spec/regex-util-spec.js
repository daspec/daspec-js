/*global DaSpec, describe, it, expect, beforeEach */
describe('regex util', function () {
	'use strict';
	var underTest;
	beforeEach(function () {
		underTest = new DaSpec.RegexUtil();
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
	});
	describe('stripListSymbol', function () {
		it('ignores lines that are not list items', function () {
			expect(underTest.stripListSymbol('**SHOUT**')).toBe('**SHOUT**');
		});
		it('removes list symbols from items', function () {
			expect(underTest.stripListSymbol('* **SHOUT**')).toBe('**SHOUT**');
			expect(underTest.stripListSymbol(' * **SHOUT**')).toBe('**SHOUT**');
			expect(underTest.stripListSymbol(' - **SHOUT**')).toBe('**SHOUT**');
			expect(underTest.stripListSymbol('- **SHOUT**')).toBe('**SHOUT**');
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
		it('recognises lists', function () {
			expect(underTest.isListItem('* **SHOUT**')).toBeTruthy();
			expect(underTest.isListItem(' * **SHOUT**')).toBeTruthy();
			expect(underTest.isListItem(' - **SHOUT**')).toBeTruthy();
			expect(underTest.isListItem('- **SHOUT**')).toBeTruthy();
		});
	});
});
