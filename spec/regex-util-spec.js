/*global DaSpec, describe, it, expect */
describe('regex util', function () {
	'use strict';
	describe('replaceMatchGroup', function () {
		it('replaces a substring corresponding to a match group by index', function () {
			expect(new DaSpec.RegexUtil().replaceMatchGroup(
				'Simple arithmetic: 22 plus 222 is 2 and 43',
				/Simple arithmetic: (\d*) plus (\d*) is (\d*) and (\d*)/,
				2,
				'XXX'
				)).toEqual('Simple arithmetic: 22 plus 222 is XXX and 43');
		});
	});
});
