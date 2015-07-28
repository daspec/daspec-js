(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global module*/
module.exports = function () {
	'use strict';
	var self = this;
	self.executed = 0;
	self.passed = 0;
	self.failed = 0;
	self.error = 0;
	self.skipped = 0;

	self.incrementCounts = function (counts) {
		self.executed += counts.executed;
		self.passed += counts.passed;
		self.failed += counts.failed;
		self.error += counts.error;
		self.skipped += counts.skipped;
	};

	self.increment = function (assertion) {
		self.executed++;
		if (assertion.passed) {
			self.passed++;
		} else {
			self.failed++;
		}
	};
	self.recordException = function (exception) {
		if (exception) {
			self.error++;
		}
	};
	self.currentCounts = function () {
		return JSON.parse(JSON.stringify(self));
	};
};

},{}],2:[function(require,module,exports){
/*global module*/
module.exports = function (expected, actual, passed, outputIndex) {
	'use strict';
	var self = this;
	self.value = actual;
	self.index = outputIndex;
	self.passed = passed;
	self.expected = expected;
};

},{}],3:[function(require,module,exports){
(function (global){
/*global require, global*/

global.DaSpec = {
	Runner: require('./daspec-runner'),
	StepDefinitions: require('../test-data/test-steps')
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../test-data/test-steps":13,"./daspec-runner":5}],4:[function(require,module,exports){
/*global module, require*/

/*
move formating out of context


- responsibilities

	-> provide md source file/s
		-> web loader
		-> file loader
		-> text area loader
	-> convert between page md and blocks (parsing)						[ExampleBlocks]
	-> convert between blocks and "steps"
		-> allow users to define matchers for steps						[Context]
		-> convert between blocks and "steps" (execution)				[Context]

	-> execution/runner
		-> control the flow on a single page (setup/steps/teardown/beforeeach/aftereach) [Runner]
		-> control the flow on a whole suite (suite setup/pages/suite teardown/beforeall/afterall) [Runner]
		-> execute "steps"												[Runner]
		-> carry "step" execution info in a format-agnostic way			[Step]
	-> format results													[Formatter]
		-> format results as md
		-> format results as counts (junit xml or tap)


*/
module.exports = function () {
	'use strict';
	var self = this,
		StepExecutor =  require('./daspec-step'),
		steps = [];

	self.defineStep = function (regexMatcher, processFunction) {
		steps.push(new StepExecutor(regexMatcher, processFunction));
	};
	self.getStepForLine = function (stepText) {
		var matchingSteps = steps.filter(function (step) {
				return step.match(stepText);
			});

		if (matchingSteps.length === 0) {
			return false;
		} else if (matchingSteps.length > 1) {
			/* bork on multiple options possible */
			throw new Error('multiple steps match line ' + stepText);
		}
		return matchingSteps[0];
	};
};

},{"./daspec-step":6}],5:[function(require,module,exports){
/*global module, require*/
module.exports = function (stepFunc) {
	'use strict';
	var Context = require('./daspec-context'),
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		ExampleBlocks = require('./example-blocks'),
		context = new Context(),
		self = this;
	stepFunc(context);

	self.example = function (inputText) {
		var MarkDownResultFormatter = require('./markdown-result-formatter'),
			results = new MarkDownResultFormatter(),
			blocks = new ExampleBlocks(inputText);

		blocks.getBlocks().forEach(function (block) {
			var blockLines = block.getMatchText(),
				blockList = block.getList();
			if (blockLines) {
				blockLines.forEach(function (line) {
					if (!regexUtil.assertionLine(line)) { //Move to block?
						results.nonAssertionLine(line);
						return;
					}

					var step = context.getStepForLine(line);
					if (!step) {
						results.skippedLine(line);
						return;
					}
					results.stepResult(step.execute(line, blockList));
				});
			}
		});
		return results.formattedResults();
	};
};

},{"./daspec-context":4,"./example-blocks":8,"./markdown-result-formatter":11,"./regex-util":12}],6:[function(require,module,exports){
/*global module, require*/
module.exports = function (regexMatcher, processFunction) {
	'use strict';
	var self = this,
		Assertion = require('./assertion');

	self.match = function (stepText) {
		return regexMatcher.test(stepText);
	};
	self.execute = function (stepText, list) {
		var match = stepText.match(regexMatcher),
			stepArgs = match.slice(1),
			result = {
				matcher: regexMatcher,
				stepText: stepText,
				list: list,
				assertions: []
			},
			StepContext = function () {
				var self = this,
					ListUtil = require('./list-util'),
					listUtil = new ListUtil();
				self.assertEquals = function (expected, actual, optionalOutputIndex) {
					var	passed = expected == actual;
					result.assertions.push(new Assertion(expected,
						actual,
						passed, optionalOutputIndex));
				};
				self.assertSetEquals = function (expected, actual, optionalOutputIndex) {
					var listResult = listUtil.unorderedMatch(expected, actual);
					result.assertions.push(new Assertion(expected,
						listResult,
						listResult.matches, optionalOutputIndex));
				};
			};

		if (list) { /* we know it's a list and the symbol */
			stepArgs.push(list);
		}

		try {
			processFunction.apply(new StepContext(), stepArgs);
		} catch (e) {
			/* geniuine error, not assertion fail */
			result.exception = e;
		}


		return result;
	};
};

},{"./assertion":2,"./list-util":9}],7:[function(require,module,exports){
/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		lines = [];
	self.addLine = function (lineText) {
		lines.unshift(lineText);
	};
	self.isComplete = function () {
		if (lines.length === 0) {
			return false;
		}
		if (regexUtil.isListItem(lines[0])) {
			return false;
		}
		return true;
	};
	self.getList = function () {
		if (lines.length === 0) {
			return false;
		}
		var topLine = lines[0];
		if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
			return {ordered: false, items: lines.filter(regexUtil.isListItem).map(regexUtil.stripListSymbol)};
		}
		return false;
	};
	self.getMatchText = function () {
		if (lines.length === 0) {
			return false;
		}
		var topLine = lines[0];
		if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
			return [topLine];
		} else {
			return lines;
		}
	};

};

},{"./regex-util":12}],8:[function(require,module,exports){
/*global module, require*/
module.exports = function (inputText) {
	'use strict';
	var self = this,
		ExampleBlock = require('./example-block');
	self.getBlocks = function () {
		var lines = inputText && inputText.split('\n').reverse(),
			current = new ExampleBlock(),
			blocks = [];
		lines.forEach(function (line) {
			current.addLine(line);
			if (current.isComplete()) {
				blocks.push(current);
				current = new ExampleBlock();
			}
		});
		if (current.getMatchText()) {
			blocks.push(current);
		}
		return blocks.reverse();
	};
};

},{"./example-block":7}],9:[function(require,module,exports){
/*global module*/
module.exports = function () {
	'use strict';
	var self = this;
	self.unorderedMatch = function (array1, array2) {
		var matching = array1.filter(function (el) {
				return array2.indexOf(el) >= 0;
			}),
			missing = array1.filter(function (el) {
				return array2.indexOf(el) < 0;
			}),
			additional = array2.filter(function (el) {
				return array1.indexOf(el) < 0;
			});
		return {
			matches: missing.length === 0 && additional.length === 0,
			missing: missing,
			additional: additional,
			matching: matching
		};
	};
};

},{}],10:[function(require,module,exports){
/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
			RegexUtil = require('./regex-util'),
			regexUtil = new RegexUtil(),
			dash = String.fromCharCode(8211),
			tick = String.fromCharCode(10003);

	self.formatPrimitiveResult = function (assertion) {
		var formattedValue = function () {
			if (assertion.passed) {
				return '**' + assertion.expected + '**';
			} else {
				return '**~~' + assertion.expected + '~~ ['  + assertion.value + ']**';
			}
		};
		return {
			index: assertion.index,
			value: formattedValue()
		};
	};
	self.formatListResult = function (listResult) {
		var tickEl = function (e) {
			return '[' + tick + '] ' + e;
		}, crossEl = function (e) {
			return '**[' + dash + '] ~~' + e + '~~**';
		}, plusEl = function (e) {
			return '**[+] ' + e + '**';
		},
			matching = (listResult.matching || []).map(tickEl),
			missing = (listResult.missing || []).map(crossEl),
			additional = (listResult.additional || []).map(plusEl);
		return matching.concat(missing, additional);
	};

	self.markResult = function (stepResult) {
		var withoutIndex = function (assertion) {
				return !assertion.index;
			},
			withIndex = function (assertion) {
				return assertion.index;
			},
			failed = function (assertion) {
				return !assertion.passed;
			},
			failedForList = function (assertion) {
				return assertion.expected === stepResult.list.items && !assertion.passed;
			},
			noIndexAssertions = stepResult.assertions.filter(withoutIndex),
			headingLine = function () {
				if (noIndexAssertions.length === 0) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.map(self.formatPrimitiveResult));
				}
				if (noIndexAssertions.some(failed)) {
					return '**~~' + stepResult.stepText + '~~**';
				}
				if (stepResult.assertions.some(failed)) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.filter(withIndex).map(self.formatPrimitiveResult));
				}
				if (stepResult.assertions.length) {
					return '**' + stepResult.stepText + '**';
				}
				return stepResult.stepText;
			},
			attachmentLines = function () {
				if (!stepResult.list) {
					return '';
				}
				var listAssertions = stepResult.assertions.filter(failedForList),
						values = stepResult.list.items;
				if (listAssertions && listAssertions.length > 0) {
					values = self.formatListResult(listAssertions[0].value);
				}
				return values.map(function (e) {
					return '\n* ' + e;
				}).join(''); // TODO: deal with ordered lists
			};
		if (stepResult.exception) {
			return '~~' + stepResult.stepText + '~~\n' + '\t' + stepResult.exception.stack; //TODO: push list as well
		}
		return headingLine() + attachmentLines();

	};
};

},{"./regex-util":12}],11:[function(require,module,exports){
/*global module, require*/
module.exports = function () {
	'use strict';
	var self = this,
		MarkDownFormatter = require('./markdown-formatter'),
		markDownFormatter = new MarkDownFormatter(),
		AssertionCounts = require('./assertion-counts'),
		resultBuffer = [],
		counts = new AssertionCounts(),
		countDescription = function (counts) {
			var labels = ['executed', 'passed', 'failed', 'error', 'skipped'],
				description = '> **In da spec:** ',
				comma = false;

			labels.forEach(function (label) {
				if (counts[label]) {
					if (comma) {
						description = description + ', ';
					} else {
						comma = true;
					}
					description = description + label + ': ' + counts[label];
				}
			});
			if (!comma) {
				description = description + 'Nada';
			}
			return description;
		};
	self.stepResult = function (result) {
		counts.recordException(result.exception);
		result.assertions.forEach(function (assertion) {
			counts.increment(assertion);
		});
		resultBuffer.push(markDownFormatter.markResult(result));
	};
	self.nonAssertionLine = function (line) {
		resultBuffer.push(line);
	};
	self.skippedLine = function (line) {
		resultBuffer.push(line);
		counts.skipped++;
	};

	self.formattedResults = function () {
		var out = resultBuffer.slice(0);
		out.unshift('');
		out.unshift(countDescription(counts));
		return out.join('\n');
	};
};

},{"./assertion-counts":1,"./markdown-formatter":10}],12:[function(require,module,exports){
/*global module*/
module.exports = function () {
	'use strict';
	var self = this;
	this.replaceMatchGroup = function (string, regex, overrides) {
		var match = string.match(regex),
			literalReplacement = regex.source,
			capturingGroup = /\([^)]*\)/,  /* todo: deal with non-capture groups */
			values = match.slice(1);
		overrides.forEach(function (replacement) {
			values[replacement.index] = replacement.value;
		});
		values.forEach(function (groupValue) {
			literalReplacement = literalReplacement.replace(capturingGroup, groupValue);
		});
		return string.replace(regex, literalReplacement);
	};
	this.isListItem = function (line) {
		if (/^[\*\s-=]*$/.test(line)) {
			return false;
		}
		if (!/^\s*[\*-]\s/.test(line)) {
			return false;
		}
		if (/^\s*\*\s/.test(line) && line.replace(/[^*]/g, '').length % 2 === 0) {
			return false;
		}
		return true;
	};
	this.stripListSymbol = function (line) {
		if (!self.isListItem(line)) {
			return line;
		}
		return line.replace(/^\s*[^\s]+\s/, '');
	};
	this.assertionLine = function (stepText) {
		if (stepText.length === 0 || stepText.trim().length === 0) {
			return false;
		}
		var linestartignores = ['#', '\t', '>', '    ', '![', '[', '***', '* * *', '---', '- - -', '===', '= = ='],
			result = true;
		linestartignores.forEach(function (lineStart) {
			if (stepText.substring(0, lineStart.length) === lineStart) {
				result = false;
			}
		});
		return result;
	};
};

},{}],13:[function(require,module,exports){
/*global module*/
module.exports = function (ctx) {
	'use strict';
	ctx.defineStep(/Simple arithmetic: (\d*) plus (\d*) is (\d*)/, function (firstArg, secondArg, expectedResult) {
		this.assertEquals(expectedResult, parseFloat(firstArg) + parseFloat(secondArg), 2);
	});
	ctx.defineStep(/Simple arithmetic: (\d*) and (\d*) added is (\d*) and multiplied is (\d*)/, function (firstArg, secondArg, expectedAdd, expectedMultiply) {
		this.assertEquals(expectedAdd, parseFloat(firstArg) + parseFloat(secondArg), 2);
		this.assertEquals(expectedMultiply, parseFloat(firstArg) * parseFloat(secondArg), 3);
	});
	ctx.defineStep(/Multiple Assertions (\d*) is (\d*) and (.*)/, function (num1, num2, lineStatus) {
		this.assertEquals(num2, num1, 1);
		this.assertEquals(lineStatus, 'passes');
	});
	ctx.defineStep(/Multiple Assertions line ([a-z]*) and ([a-z]*)/, function (lineStatus1, lineStatus2) {
		this.assertEquals(lineStatus1, 'passes');
		this.assertEquals(lineStatus2, 'passes');
	});
	ctx.defineStep(/Star Wars has the following episodes:/, function (listOfEpisodes) {
		var episodes = [
			'A New Hope',
			'The Empire Strikes Back',
			'Return of the Jedi'];
		this.assertSetEquals(listOfEpisodes.items, episodes);
	});
	var films = {};
	ctx.defineStep(/These are the ([A-Za-z ]*) Films/, function (seriesName, tableOfReleases) {
/*
		Table with title row
		[
			{Title:'A New Hope', Year:1979},
			{Title:'The Empire Strikes Back', Year:1979},
			{Title:'The Return of the Jedi', Year:1979}
		],

		Table with no Title Row
		[
			{0:'A New Hope', 1:1979},
			{0:'The Empire Strikes Back', 1:1979},
			{0:'The Return of the Jedi', 1:1979}
		]
*/
		films[seriesName] = tableOfReleases;
	});
	ctx.defineStep(/In total there a (\d*) ([A-Za-z ]*) Films/, function (numberOfFilms, seriesName) {
		var actual = films[seriesName] && films[seriesName].length;
		this.assertEquals(parseFloat(numberOfFilms), actual, 0);
	});

	ctx.defineStep(/\|([A-Za-z ]*) episode \| Year of release \|/, function (seriesName, episode, yearOfRelease) {
		var series = films[seriesName],
			matching = series && series.filter(function (film) {
				return film.Title === episode;
			}),
			actualYear = matching && matching.length > 0 && (matching[0].Year || matching[0][1]);

		this.assertEquals(yearOfRelease, actualYear, 1);
	});
};

},{}]},{},[3]);
