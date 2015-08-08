/*global describe, expect, it, require, DaSpecHelper  */

describe('Key Examples from test-data', function () {
	'use strict';
	var stepDefinitions = require('../test-data/test-steps'),
		Runner = require('../src/runner'),
		MarkDownResultFormatter = require('../src/markdown-result-formatter'),
		helper = new DaSpecHelper(),
		exampleFiles = helper.getExamples();
	exampleFiles.forEach(function (exampleName) {
		var example = helper.loadExample(exampleName);
		it(example.title, function () {
			var resultFormatter = new MarkDownResultFormatter(),
				runner = new Runner(stepDefinitions, resultFormatter);
			runner.example(example.input);
			expect(resultFormatter.formattedResults()).toEqual(example.output);

		});
	});
});
