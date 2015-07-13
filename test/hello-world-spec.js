/*global describe, it, expect, DAS*/

describe('Hello', function () {
	'use strict';
	it('works', function () {
		expect(DAS.hello('World')).toEqual('Hello World');
	});
});
