/*global describe, expect, it, require, DaSpecHelper, global  */

describe('Key Examples from test-data', function () {
	'use strict';
	var stepDefinitions = require('../test-data/test-steps'),
		Runner = require('../src/runner'),
		MarkDownResultFormatter = require('../src/markdown-result-formatter'),
		helper = new DaSpecHelper(),
		exampleFiles = helper.getExamples(),
		exportObject = function (ob) {
			var c;
			for (c in ob) {
				global[c] = ob[c];
			}
		};
	exampleFiles.forEach(function (exampleName) {
		var example = helper.loadExample(exampleName);
		it(example.title, function () {
			var runner = new Runner(function (specContext) {
					exportObject(specContext);
					stepDefinitions(specContext);
				}),
				resultFormatter = new MarkDownResultFormatter(runner);
			runner.execute(example.input);
			expect(resultFormatter.formattedResults()).toEqual(example.output);

		});
	});
});
