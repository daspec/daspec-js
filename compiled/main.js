(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global module*/
module.exports = function AssertionCounts() {
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
module.exports = function Assertion(expected, actual, passed, outputIndex) {
	'use strict';
	var self = this;
	self.value = actual;
	self.index = outputIndex;
	self.passed = passed;
	self.expected = expected;
};

},{}],3:[function(require,module,exports){
/*global module, require*/
module.exports = function Context() {
	'use strict';
	var self = this,
		StepExecutor =  require('./step-executor'),
		steps = [],
		matchingSteps = function (stepText) {
			return steps.filter(function (step) {
				return step.match(stepText);
			});
		};
	self.defineStep = function (regexMatcher, processFunction) {
		if (!regexMatcher) {
			throw new Error('Empty matchers are not supported');
		}
		if (!(regexMatcher instanceof RegExp)) {
			throw new Error('Matcher must be a regex');
		}
		if (regexMatcher.source.indexOf('(?:') >= 0) {
			throw new Error('Non-capturing regex groups are not supported');
		}
		var matching = matchingSteps(regexMatcher);
		if (matching.length > 0) {
			throw new Error('The matching step is already defined');
		}
		steps.push(new StepExecutor(regexMatcher, processFunction));
	};
	self.getStepForLine = function (stepText) {
		var matching = matchingSteps(stepText);
		if (matching.length === 0) {
			return false;
		} else if (matching.length > 1) {
			throw new Error('multiple steps match line ' + stepText);
		}
		return matching[0];
	};
};

},{"./step-executor":14}],4:[function(require,module,exports){
(function (global){
/*global require, global*/

global.DaSpec = {
	Runner: require('./runner'),
	StepDefinitions: require('../test-data/test-steps')
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../test-data/test-steps":16,"./runner":12}],5:[function(require,module,exports){
/*global module, require*/
module.exports = function ExampleBlock() {
	'use strict';
	var self = this,
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		TableUtil = require('./table-util'),
		tableUtil = new TableUtil(),
		Normaliser = require('./normaliser'),
		normaliser = new Normaliser(),
		lines = [],
		toItems = function (lines) {
			return lines.map(tableUtil.cellValuesForRow);
		},
		toTable = function (lines) {
			var tableItems = lines, result = {type: 'table'};
			if (lines.length > 2 && regexUtil.isTableHeaderDivider(lines[1])) {
				result.titles =  tableUtil.cellValuesForRow(lines[0]);
				if (normaliser.containsDuplicates(result.titles)) {
					throw new SyntaxError('Attachment table has multiple equivalent column names');
				}
				if (result.titles.some(regexUtil.isEmpty)) {
					throw new SyntaxError('Attachment table has a column without a name');
				}
				tableItems = lines.slice(2);
			}
			result.items = toItems(tableItems);
			return result;
		},
		getAttachmentTable = function () {
			if (lines.length === 0) {
				return false;
			}
			var topLine = lines[0],
				tableLines = lines.filter(regexUtil.isTableItem);
			if (tableLines.length === 0) {
				return false;
			}
			if (!regexUtil.isTableItem(topLine) && regexUtil.assertionLine(topLine)) {
				return toTable(tableLines);
			}
			return false;
		},
		getAttachmentList = function () {
			//TODO: support nested lists
			if (lines.length === 0) {
				return false;
			}
			var topLine = lines[0],
				listLines = lines.filter(regexUtil.isListItem),
				listSymbol;
			if (listLines.length === 0) {
				return false;
			}
			listSymbol = regexUtil.getListSymbol(listLines[0]);
			if (!regexUtil.isListItem(topLine) && regexUtil.assertionLine(topLine)) {
				return {type: 'list',
					ordered: !isNaN(parseFloat(listSymbol)),
					items: listLines.map(regexUtil.stripListSymbol),
					symbol: listSymbol
				};
			}
			return false;
		};
	self.addLine = function (lineText) {
		lines.unshift(lineText);
	};
	self.isComplete = function () {
		if (lines.length === 0) {
			return false;
		}
		if (regexUtil.isListItem(lines[0]) || regexUtil.isTableItem(lines[0]) || lines[0].trim().length === 0) {
			return false;
		}
		return true;
	};
	self.getAttachment = function () {
		return getAttachmentList() || getAttachmentTable();
	};

	self.isTableBlock = function () {
		var tableLines = lines.filter(regexUtil.isTableItem),
			nonTableAssertionLine = function (line) {
				return regexUtil.assertionLine(line) && !regexUtil.isTableItem(line);
			};
		if (tableLines.length === 0) {
			return false;
		}
		if (lines.filter(nonTableAssertionLine).length > 0) {
			return false;
		}
		return true;
	};

	self.getMatchText = function () {
		if (lines.length === 0) {
			return [];
		}
		var nonAttachmentLine = function (line) {
				return !regexUtil.isListItem(line) && !regexUtil.isTableItem(line);
			},
			topLine = lines[0];
		if (nonAttachmentLine(topLine) && regexUtil.assertionLine(topLine)) {
			return lines.filter(nonAttachmentLine);
		} else {
			return lines;
		}
	};
};

},{"./normaliser":10,"./regex-util":11,"./table-util":15}],6:[function(require,module,exports){
/*global module, require*/
module.exports = function ExampleBlocks(inputText) {
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
		if (current.getMatchText().length > 0) {
			blocks.push(current);
		}
		return blocks.reverse();
	};
};

},{"./example-block":5}],7:[function(require,module,exports){
/*global module*/
module.exports = function ListUtil() {
	'use strict';
	var self = this,
			arrayEquals = function (array1, array2) {
				var i;
				if (!Array.isArray(array1) || !Array.isArray(array2) || array1.length !== array2.length) {
					return false;
				}
				for (i = 0; i < array1.length; i++) {
					if (array2[i] != array1[i]) {
						return false;
					}
				}
				return true;
			},
			equals = function (item) {
				if (Array.isArray(item)) {
					return arrayEquals(item, this);
				} else {
					return item == this;
				}
			};
	self.unorderedMatch = function (array1, array2) {
		array1 = array1 || [];
		array2 = array2 || [];
		var matching = array1.filter(function (el) {
				return array2.some(equals, el);
			}),
			missing = array1.filter(function (el) {
				return !array2.some(equals, el);
			}),
			additional = array2.filter(function (el) {
				return !array1.some(equals, el);
			});
		return {
			matches: missing.length === 0 && additional.length === 0,
			missing: missing,
			additional: additional,
			matching: matching
		};
	};
};

},{}],8:[function(require,module,exports){
/*global module, require*/
module.exports = function MarkDownFormatter() {
	'use strict';
	var self = this,
			RegexUtil = require('./regex-util'),
			TableUtil = require('./table-util'),
			regexUtil = new RegexUtil(),
			tableUtil = new TableUtil(),
			dash = String.fromCharCode(8211),
			tick = String.fromCharCode(10003),
			crossValueAndExpected = function (expected, actual) {
				var formatActual = '';
				if (actual !== undefined) {
					formatActual = ' ['  + actual + ']';
				}
				return '**~~' + expected + '~~'  + formatActual + '**';
			},
			crossValue = function (expected) {
				return '**~~' + expected + '~~**';
			},
			boldValue = function (expected) {
				return '**' + expected + '**';
			};
	self.formatPrimitiveResult = function (assertion) {
		var formattedValue = function () {
			if (assertion.passed) {
				return boldValue(assertion.expected);
			} else {
				return crossValueAndExpected(assertion.expected, assertion.value);
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
	self.getTableResult = function (tableResult) {
		var tickRow = function (row) {
			return [tick].concat(row);
		}, crossRow = function (row) {
			return [dash].concat(row.map(crossValue));
		}, plusRow = function (row) {
			return ['+'].concat(row.map(boldValue));
		},
			matching = (tableResult.matching || []).map(tickRow),
			missing = (tableResult.missing || []).map(crossRow),
			additional = (tableResult.additional || []).map(plusRow);
		return matching.concat(missing, additional);

	};
	self.markResult = function (stepResult) {
		var withoutIndex = function (assertion) {
				return !assertion.index && assertion.index !== 0;
			},
			withIndex = function (assertion) {
				return assertion.index;
			},
			failed = function (assertion) {
				return !assertion.passed;
			},
			failedForAttachment = function (assertion) {
				return stepResult.attachment && stepResult.attachment.items && stepResult.attachment.items.length > 0 &&
					(assertion.expected === stepResult.attachment.items || assertion.expected == stepResult.attachment) &&
					!assertion.passed;
			},
			headingLine = function () {
				if (stepResult.exception) {
					return crossValue(stepResult.stepText);
				}
				var noIndexAssertions = stepResult.assertions.filter(withoutIndex);
				if (noIndexAssertions.length === 0) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.map(self.formatPrimitiveResult));
				}
				if (noIndexAssertions.some(failed)) {
					if (regexUtil.isListItem(stepResult.stepText)) {
						return regexUtil.getListSymbol(stepResult.stepText) + '**~~' + regexUtil.stripListSymbol(stepResult.stepText) + '~~**';
					} else if (regexUtil.isTableItem(stepResult.stepText)) {
						return '| ' + tableUtil.cellValuesForRow(stepResult.stepText).map(crossValue).join(' | ') + ' |';
					} else {
						return crossValue(stepResult.stepText);
					}
				}
				if (stepResult.assertions.some(failed)) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.filter(withIndex).map(self.formatPrimitiveResult));
				}
				if (stepResult.assertions.length) {
					if (regexUtil.isListItem(stepResult.stepText)) {
						return regexUtil.getListSymbol(stepResult.stepText) + '**' + regexUtil.stripListSymbol(stepResult.stepText) + '**';
					} else if (regexUtil.isTableItem(stepResult.stepText)) {
						return '| ' + tableUtil.cellValuesForRow(stepResult.stepText).map(boldValue).join(' | ') + ' |';
					} else {
						return boldValue(stepResult.stepText);
					}
				}
				return stepResult.stepText;
			},
			attachmentLines = function () {
				if (!stepResult.attachment) {
					return '';
				}
				var formatList = function () {
						if (stepResult.attachment.type !== 'list') {
							return false;
						}
						var failedListAssertions = stepResult.assertions.filter(failedForAttachment),
							values = stepResult.attachment.items,
							symbol = stepResult.attachment.symbol || '* ';
						if (failedListAssertions && failedListAssertions.length > 0) {
							values = self.formatListResult(failedListAssertions[0].value);
						}
						return '\n' + symbol + values.join('\n' + symbol);
					},
					formatTableItem = function (item) {
						return '|' + item.join('|') + '|';
					},
					formatTable = function () {
						if (stepResult.attachment.type !== 'table') {
							return false;
						}
						var resultTitles = stepResult.attachment.titles && stepResult.attachment.titles.slice(0),
								failedTableAssertions = stepResult.assertions.filter(failedForAttachment),
								values = stepResult.attachment.items,
								resultRows = [];
						if (failedTableAssertions && failedTableAssertions.length > 0) {
							if (resultTitles) {
								resultTitles.unshift(' ');
							}
							values = self.getTableResult(failedTableAssertions[0].value);
						}
						if (resultTitles) {
							resultRows.push(formatTableItem(resultTitles));
							resultRows.push(resultTitles.map(function () {
								return '|-';
							}).join('') + '|');
						}
						resultRows = resultRows.concat(values.map(formatTableItem));
						return '\n' + tableUtil.justifyTable(resultRows).join('\n');
					};
				return formatList() || formatTable();
			},
			exceptionReport = function () {
				if (!stepResult.exception) {
					return '';
				}
				return '\n<!--\n' + stepResult.exception + '\n-->';
			};
		return headingLine() + attachmentLines() + exceptionReport();
	};
};

},{"./regex-util":11,"./table-util":15}],9:[function(require,module,exports){
/*global module, require*/
module.exports = function MarkdownResultFormatter() {
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
		},
		TableResultBlock = function () {
			var self = this,
				tableCounts = new AssertionCounts(),
				tableRows = [],
				TableUtil = require('./table-util'),
				tableUtil = new TableUtil();
			self.counts = tableCounts;
			self.nonAssertionLine = function (line) {
				tableRows.push(line);
			};
			self.stepResult = function (result) {
				tableCounts.recordException(result.exception);
				result.assertions.forEach(function (assertion) {
					tableCounts.increment(assertion);
				});
				tableRows.push(markDownFormatter.markResult(result));
			};
			self.formattedResults = function () {
				return tableUtil.justifyTable(tableRows);
			};
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
	self.appendResultBlock = function (formatter) {
		counts.incrementCounts(formatter.counts);
		resultBuffer = resultBuffer.concat(formatter.formattedResults());
	};
	self.tableResultBlock = function () {
		return new TableResultBlock();
	};
};

},{"./assertion-counts":1,"./markdown-formatter":8,"./table-util":15}],10:[function(require,module,exports){
/*global module*/
module.exports = function Normaliser() {
	'use strict';
	var self = this;
	self.normaliseString = function (string) {
		return string.toLocaleLowerCase().replace(/\s/g, '');
	};
	self.normaliseObject = function (object) {
		var result = {};
		Object.keys(object).forEach(function (key) {
			result[self.normaliseString(key)] = object[key];
		});
		return result;
	};
	self.containsDuplicates = function (stringArray) {
		if (!stringArray || !stringArray.length) {
			return false;
		}
		var normalised = stringArray.map(self.normaliseString),
			i, j;
		for (i = 0; i < normalised.length - 1; i++) {
			for (j = i + 1; j < normalised.length; j++) {
				if (normalised[i] === normalised[j]) {
					return true;
				}
			}
		}
		return false;
	};
};

},{}],11:[function(require,module,exports){
/*global module*/
module.exports = function RegexUtil() {
	'use strict';
	var self = this,
			listSymbolRegex = /^\s*[^\s]+\s+/;
	this.replaceMatchGroup = function (string, regex, overrides) {
		var everythingInMatchGroups = new RegExp('(' + regex.source.replace(/([^\\]?)[()]/g, '$1)(') + ')'),
				allMatches = string.match(everythingInMatchGroups),
				initial =  string.substring(0, allMatches.index),
				trailing = string.substring(allMatches.index + allMatches[0].length),
				values = allMatches.slice(1);
		overrides.forEach(function (replacement) {
			var findIndex = replacement.index * 2 + 1;
			if (replacement.index >= 0 && findIndex < (values.length - 1)) {
				values[findIndex] = replacement.value;
			}
		});
		return initial + values.join('') + trailing;
	};
	this.isCodeItem = function (line) {
		if (!line || line.trim().length === 0) {
			return false;
		}
		return /^\s\s\s\s/.test(line) || /^\s*\t/.test(line);
	};
	this.isTableItem = function (line) {
		return !self.isCodeItem(line) && /^\s*\|/.test(line);
	};
	this.isTableDataRow = function (line) {
		return self.isTableItem(line) && !self.isTableHeaderDivider(line);
	};
	this.isTableHeaderDivider = function (line) {
		return self.isTableItem(line) && /^[|= -]*$/.test(line);
	};
	this.isEmpty = function (line) {
		return /^\s*$/.test(line);
	};
	this.isListItem = function (line) {
		if (/^\s*\d+.\s/.test(line)) {
			return true;
		}
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
		return line.replace(listSymbolRegex, '');
	};
	this.getListSymbol = function (line) {
		if (!self.isListItem(line)) {
			return '';
		}
		return line.match(listSymbolRegex)[0];
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
	this.regexForTableDataRow = function (cells) {
		if (!cells || cells < 0) {
			return false;
		}
		var regexTemplate = '\\|',
			cellTemplate = '(.*)\\|',
			i;
		for (i = 0; i < cells; i++) {
			regexTemplate = regexTemplate + cellTemplate;
		}
		return new RegExp(regexTemplate);
	};
};

},{}],12:[function(require,module,exports){
/*global module, require*/
module.exports = function Runner(stepFunc) {
	'use strict';
	var Context = require('./context'),
		RegexUtil = require('./regex-util'),
		regexUtil = new RegexUtil(),
		ExampleBlocks = require('./example-blocks'),
		context = new Context(),
		self = this;
	stepFunc(context);

	self.example = function (inputText) {
		var MarkDownResultFormatter = require('./markdown-result-formatter'),
			results = new MarkDownResultFormatter(),
			blocks = new ExampleBlocks(inputText),
			processTableBlock = function (block) {
				var blockLines = block.getMatchText(),
					step,
					headerLine,
					tableResultBlock,
					startNewTable = function (line) {
						step = context.getStepForLine(line);
						if (!step) {
							results.skippedLine(line);
						} else {
							headerLine = line;
							tableResultBlock = results.tableResultBlock();
							tableResultBlock.nonAssertionLine(line);
						}
					},
					endCurrentTable = function () {
						step = false;
						if (tableResultBlock) {
							results.appendResultBlock(tableResultBlock);
							tableResultBlock = false;
						}
					};
				blockLines.forEach(function (line) {
					if (!regexUtil.isTableItem(line)) {
						endCurrentTable();
						results.nonAssertionLine(line);
					} else if (!tableResultBlock) {
						startNewTable(line);
					} else if (regexUtil.isTableDataRow(line)) {
						tableResultBlock.stepResult(step.executeTableRow(line, headerLine));
					} else {
						tableResultBlock.nonAssertionLine(line);
					}
				});
				endCurrentTable();
			},
			processBlock = function (block) {
				var blockLines = block.getMatchText(),
					blockParam = block.getAttachment();
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
					results.stepResult(step.execute(line, blockParam));
				});
			};

		blocks.getBlocks().forEach(function (block) {
			if (block.isTableBlock()) {
				processTableBlock(block);
			} else {
				processBlock(block);
			}
		});
		return results.formattedResults();
	};
};

},{"./context":3,"./example-blocks":6,"./markdown-result-formatter":9,"./regex-util":11}],13:[function(require,module,exports){
/*global module, require*/
module.exports = function StepContext(result) {
	'use strict';
	var self = this,
			ListUtil = require('./list-util'),
			TableUtil = require('./table-util'),
			Assertion = require('./assertion'),
			tableUtil = new TableUtil(),
			listUtil = new ListUtil();
	self.assertEquals = function (expected, actual, optionalOutputIndex) {
		var	passed = expected == actual;
		result.assertions.push(new Assertion(expected,
					actual,
					passed, optionalOutputIndex));
	};
	self.assertUnorderedTableEquals = function (expected, actual) {
		var comparisonObject;
		if (!expected.titles) {
			comparisonObject = actual;
			if (actual.type === 'table' && Array.isArray(actual.items)) {
				comparisonObject = actual.items;
			}
		} else {
			if (actual.type === 'table' && Array.isArray(actual.items)) {
				comparisonObject = tableUtil.tableValuesForTitles(actual, expected.titles);
			}	else {
				comparisonObject = tableUtil.objectArrayValuesForTitles(actual, expected.titles);
			}
		}
		return self.assertSetEquals(expected.items, comparisonObject);
	};
	self.assertSetEquals = function (expected, actual) {
		var listResult = listUtil.unorderedMatch(expected, actual);
		result.assertions.push(new Assertion(expected,
					listResult,
					listResult.matches));
	};
};

},{"./assertion":2,"./list-util":7,"./table-util":15}],14:[function(require,module,exports){
/*global module, require*/
module.exports = function StepExecutor(regexMatcher, processFunction) {
	'use strict';
	var self = this,
		StepContext = require('./step-context'),
		TableUtil = require('./table-util'),
		RegExUtil = require('./regex-util');
	self.match = function (stepText) {
		if (stepText instanceof RegExp) {
			return regexMatcher.source === stepText.source;
		}
		return regexMatcher.test(stepText);
	};
	self.execute = function (stepText, attachment) {
		var match = stepText.match(regexMatcher),
			stepArgs = match.slice(1),
			result = {
				matcher: regexMatcher,
				stepText: stepText,
				attachment: attachment,
				assertions: []
			},
			stepContext = new StepContext(result);

		if (attachment) { /* we know it's a list and the symbol */
			stepArgs.push(attachment);
		}

		try {
			processFunction.apply(stepContext, stepArgs);
		} catch (e) {
			/* geniuine error, not assertion fail */
			result.exception = e;
		}


		return result;
	};
	self.executeTableRow = function (dataRow, titleRow) {
		var tableUtil = new TableUtil(),
			regexUtil = new RegExUtil(),
			stepArgs = tableUtil.cellValuesForRow(dataRow),
			matcher = regexUtil.regexForTableDataRow(stepArgs.length),
			result = {
				matcher: matcher,
				stepText: dataRow,
				assertions: []
			},
			stepContext = new StepContext(result),
			titleMatch = titleRow && titleRow.match(regexMatcher),
			titleArgs = titleMatch && titleMatch.length > 1 && titleMatch.slice(1).map(function (item) {
				return item.trim();
			});

		if (titleArgs) {
			stepArgs = stepArgs.concat(titleArgs);
		}
		processFunction.apply(stepContext, stepArgs);

		return result;
	};
};

},{"./regex-util":11,"./step-context":13,"./table-util":15}],15:[function(require,module,exports){
/*global module, require*/
module.exports = function TableUtil() {
	'use strict';
	var self = this,
		RegexUtil = require ('./regex-util'),
		regexUtil = new RegexUtil(),
		Normaliser = require ('./normaliser'),
		normaliser = new Normaliser();

	self.cellValuesForRow = function (dataRow) {
		if (!dataRow || dataRow.trim() === '') {
			return [];
		}
		var values = dataRow.split('|');
		if (values.length < 3) {
			return [];
		}
		values.pop();
		values =  values.slice(1);
		return values.map(function (v) {
			return v.trim();
		});
	};
	self.tableValuesForTitles = function (table, titles) {
		if (!titles || titles.length === 0) {
			return false;
		}
		var pickItems = function (tableRow) {
				return columnIndexes.map(function (val) {
					return tableRow[val];
				});
			},
			normalisedTitles = titles.map(normaliser.normaliseString),
			normalisedTableTitles = table.titles.map(normaliser.normaliseString),
			columnIndexes = normalisedTitles.map(function (title) {
				return normalisedTableTitles.indexOf(title);
			});
		return table.items.map(pickItems);
	};
	self.objectArrayValuesForTitles = function (list, titles) {
		if (!titles || titles.length === 0) {
			return false;
		}
		var normalisedTitles = titles.map(normaliser.normaliseString),
			pickItems = function (item) {
				return normalisedTitles.map(function (title) {
					return item[title];
				});
			};
		return list.map(normaliser.normaliseObject).map(pickItems);
	};
	self.justifyTable = function (stringArray) {
		var maxCellLengths = function (maxSoFar, tableRow, index) {
				if (dividerRows[index]) {
					return maxSoFar;
				}
				var currentLengths = tableRow.map(function (s) {
					return s.length;
				});
				if (!maxSoFar) {
					return currentLengths;
				} else {
					return currentLengths.map(function (v, i) {
						return Math.max(v, (maxSoFar[i] || 0));
					});
				}
			},
			cellValues = stringArray.map(self.cellValuesForRow),
			dividerRows = stringArray.map(regexUtil.isTableHeaderDivider),
			columnLengths = cellValues.reduce(maxCellLengths, []),
			padding = function (howMuch, padChar) {
				return new Array(howMuch + 1).join(padChar);
			},
			padCells = function (cells, rowIndex) {
				return cells.map(function (cellVal, index) {
					if (dividerRows[rowIndex]) {
						return padding(2 + columnLengths[index], '-');
					} else {
						return ' '  + cellVal + padding(1 + columnLengths[index] - cellVal.length, ' ');
					}
				});
			},
			joinCells = function (cells) {
				return '|' + cells.join('|')	+ '|';
			};
		return cellValues.map(padCells).map(joinCells);
	};
};

},{"./normaliser":10,"./regex-util":11}],16:[function(require,module,exports){
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
	var films = {}, tables = {};
	ctx.defineStep(/These are the ([A-Za-z ]*) Films/, function (seriesName, tableOfReleases) {
		films[seriesName] = tableOfReleases.items;
		tables[seriesName] = tableOfReleases;
	});
	ctx.defineStep(/In total there a (\d*) ([A-Za-z ]*) Films/, function (numberOfFilms, seriesName) {
		var actual = (films[seriesName] && films[seriesName].length) || 0;
		this.assertEquals(parseFloat(numberOfFilms), actual, 0);
	});
	ctx.defineStep(/Good ([A-Za-z ]*) Films are/, function (seriesName, listOfEpisodes) {
		var actual = films[seriesName];
		this.assertSetEquals(listOfEpisodes.items, actual);
	});
	ctx.defineStep(/Check ([A-Za-z ]*) Films/, function (seriesName, listOfEpisodes) {
		this.assertUnorderedTableEquals(listOfEpisodes, tables[seriesName]);
	});
	ctx.defineStep(/\|([A-Za-z ]*) episode \| Year of release \|/, function (episode, yearOfRelease, seriesName) {
		var series = films[seriesName],
			matching = series && series.filter(function (film) {
				return film[0] === episode;
			}),
			actualYear = matching && matching.length > 0 && matching[0][1];
		this.assertEquals(true, !!series);
		this.assertEquals(true, !!matching && matching.length);
		this.assertEquals(yearOfRelease, actualYear, 1);
	});

	ctx.defineStep(/\| Positional Check episodes of ([A-Za-z ]*) \| Year of release \|/, function (episode, yearOfRelease, seriesName) {
		var series = films[seriesName],
			matching = series && series.filter(function (film) {
				return film[0] === episode;
			}),
			actualYear = matching && matching.length > 0 && matching[0][1];
		this.assertEquals(yearOfRelease, actualYear, 1);
	});

};

},{}]},{},[4]);
