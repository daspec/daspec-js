/*global describe, expect, it, require, DaSpecHelper  */

describe('Key Examples from test-data', function () {
	'use strict';
	var stepDefinitions = require('../test-data/test-steps'),
		Runner = require('../src/runner'),
		helper = new DaSpecHelper(),
		exampleFiles = helper.getExamples();
	exampleFiles.forEach(function (exampleName) {
		var example = helper.loadExample(exampleName);
		it(example.title, function () {
			var runner = new Runner(stepDefinitions),
				result = runner.example(example.input);
			expect(result).toEqual(example.output);

		});
	});
});
