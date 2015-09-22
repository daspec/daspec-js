(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var pSlice = Array.prototype.slice;
var objectKeys = require('./lib/keys.js');
var isArguments = require('./lib/is_arguments.js');

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}

},{"./lib/is_arguments.js":2,"./lib/keys.js":3}],2:[function(require,module,exports){
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};

},{}],3:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
(function (global){
/*global module, global*/
module.exports = function Context() {
	'use strict';
	var self = this,
		steps = [],
		expectationMatchers = [],
		stepMatch = function (stepDefinition, stepText) {
			if (stepText instanceof RegExp) {
				return stepDefinition.matcher.source === stepText.source;
			}
			if (!stepText) {
				return false;
			}
			return !!stepText.match(stepDefinition.matcher);
		},
		matchingSteps = function (stepText) {
			return steps.filter(function (stepDefinition) {
				return stepMatch(stepDefinition, stepText);
			});
		},
		globalOverrides = {};
	self.exportToGlobal = function () {
		['defineStep', 'addMatchers'].forEach(function (prop) {
			self.overrideGlobal(prop, self[prop]);
		});
	};
	self.addMatchers = function (matcherObject) {
		expectationMatchers.push(matcherObject);
	};
	self.getMatchers = function () {
		return expectationMatchers;
	};
	self.overrideGlobal = function (propname, value) {
		if (!globalOverrides[propname]) {
			globalOverrides[propname] = global[propname];
		}
		global[propname] = value;
	};
	self.resetGlobal = function () {
		var propname;
		for (propname in globalOverrides) {
			global[propname] = globalOverrides[propname];
			delete globalOverrides[propname];
		}
	};
	self.defineStep = function (regexMatcher, processFunction) {
		var matching;
		if (!regexMatcher) {
			throw new Error('Empty matchers are not supported');
		}
		if (regexMatcher.source.indexOf('(?:') >= 0) {
			throw new Error('Non-capturing regex groups are not supported');
		}
		matching = matchingSteps(regexMatcher);
		if (matching.length > 0) {
			throw new Error('The matching step is already defined');
		}
		steps.push({matcher: regexMatcher, processFunction: processFunction});
	};
	self.getStepDefinitionForLine = function (stepText) {
		var matching = matchingSteps(stepText);
		if (matching.length === 0) {
			return false;
		} else if (matching.length > 1) {
			throw new Error('multiple steps match line ' + stepText);
		}
		return matching[0];
	};
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
/*global module, require*/
module.exports = function CountingResultListener(runner) {
	'use strict';
	var self = this,
		AssertionCounts = require('./assertion-counts');

	self.current = new AssertionCounts();
	self.total = new AssertionCounts();

	runner.addEventListener('stepResult', function (result) {
		self.current.recordException(result.exception);
		result.assertions.forEach(function (assertion) {
			self.current.increment(assertion);
		});
	});

	runner.addEventListener('skippedLine', function () {
		self.current.skipped++;
	});
	runner.addEventListener('specStarted', function () {
		self.current = new AssertionCounts();
	});
	runner.addEventListener('specEnded', function () {
		self.total.incrementCounts(self.current);
	});
};

},{"./assertion-counts":4}],7:[function(require,module,exports){
/*global module, require */
module.exports = {
	Runner: require('./runner'),
	MarkdownResultFormatter: require('./markdown-result-formatter'),
	CountingResultListener: require('./counting-result-listener'),
	ExpectationBuilder: require('./expectation-builder'),
	TableUtil: require('./table-util')
};

},{"./counting-result-listener":6,"./expectation-builder":12,"./markdown-result-formatter":15,"./runner":22,"./table-util":25}],8:[function(require,module,exports){
(function (global){
/*global require, global*/

global.DaSpec = require('./daspec-npm-main');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./daspec-npm-main":7}],9:[function(require,module,exports){
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

		getAttachmentTable = function (tableLines) {
			if (!regexUtil.isTableItem(tableLines[0])) {
				return false;
			}
			return toTable(tableLines);
		},
		getAttachmentList = function (listLines) {
			var listSymbol;
			if (!regexUtil.isListItem(listLines[0])) {
				return false;
			}
			listSymbol = regexUtil.getListSymbol(listLines[0]);
			return {type: 'list',
				ordered: !isNaN(parseFloat(listSymbol)),
				items: listLines.map(regexUtil.lineItemContent),
				symbol: listSymbol
			};
		};
	self.addLine = function (lineText) {
		lines.unshift(lineText);
	};
	self.getAttachment = function () {
		var attachmentLines = self.getAttachmentLines().filter(regexUtil.assertionLine);

		if (attachmentLines.length === 0) {
			return false;
		}
		return getAttachmentList(attachmentLines) || getAttachmentTable(attachmentLines);
	};
	self.getAttachmentLines = function () {
		var topLine,
			isAttachmentLine = function (line) {
				return regexUtil.isTableItem(line) || regexUtil.isListItem(line);
			};
		if (lines.length === 0) {
			return [];
		}
		topLine = lines[0];
		if (!regexUtil.assertionLine(topLine) || regexUtil.isTableItem(topLine) || regexUtil.isListItem(topLine)) {
			return [];
		}
		return lines.filter(isAttachmentLine);
	};
	self.canAddLine = function (line) {
		var lineType = function (theLine) {
				if (regexUtil.isListItem(theLine)) {
					return 'list';
				} else if (regexUtil.isTableItem(theLine)) {
					return 'table';
				} else if (regexUtil.assertionLine(theLine)) {
					return 'assertion';
				} else if (regexUtil.isEmpty(theLine)) {
					return 'empty';
				} else {
					return 'comment';
				}
			},
			topline, newLineType, topLineType;
		if (lines.length === 0) {
			return true;
		}
		topline = lines[0];
		newLineType = lineType(line);
		topLineType = lineType(topline);

		if (topLineType == 'assertion') {
			return false;
		}

		switch (newLineType) {
			case 'list':
			case 'table':
			case 'comment':
				return topLineType === newLineType;
			case 'assertion':
			case 'empty':
				return ['table', 'list', 'empty'].indexOf(topLineType) >= 0;
		}
		return false;
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
		var nonAttachmentLine = function (line) {
				return !regexUtil.isListItem(line) && !regexUtil.isTableItem(line);
			},
			topLine;
		if (lines.length === 0) {
			return [];
		}
		topLine = lines[0];
		if (nonAttachmentLine(topLine) && regexUtil.assertionLine(topLine)) {
			return lines.filter(nonAttachmentLine);
		} else {
			return lines;
		}
	};
};

},{"./normaliser":18,"./regex-util":21,"./table-util":25}],10:[function(require,module,exports){
/*global module, require*/
module.exports = function ExampleBlocks(inputText) {
	'use strict';
	var self = this,
		ExampleBlock = require('./example-block');
	self.getBlocks = function () {
		var lines = inputText && inputText.split('\n').reverse(),
			current = new ExampleBlock(),
			blocks = [current];
		lines.forEach(function (line) {
			if (!current.canAddLine(line)) {
				current = new ExampleBlock();
				blocks.push(current);
			}
			current.addLine(line);
		});
		return blocks.reverse();
	};
};

},{"./example-block":9}],11:[function(require,module,exports){
/*global module, require */
module.exports = function Expect(actualValue, matchersArray) {
	'use strict';
	var self = this,
		negated = false,
		assertions = [],
		addMatchers = function (matchers) {
			var matcherName;
			for (matcherName in matchers) {
				if (matchers.hasOwnProperty(matcherName) && typeof matchers[matcherName] === 'function') {
					self[matcherName] = matchers[matcherName].bind(self);
				}
			}
		},
		deepEqual = require('deep-equal');
	if (Array.isArray(matchersArray)) {
		matchersArray.forEach(addMatchers);
	} else if (matchersArray) {
		addMatchers(matchersArray);
	}
	self.pushAssertions = function (pushedAssertions) {
		if (pushedAssertions && pushedAssertions.length) {
			assertions = assertions.concat(pushedAssertions);
		}
	};
	self.addAssertion = function (didPass, expected, detail) {
			var calcPassed = function (didPass) {
					if (negated) {
						return !didPass;
					}
					return didPass;
				},
				assertion = {actual: self.actual, passed: calcPassed(didPass)};
			if (detail) {
				assertion.detail = detail;
			}
			if (expected) {
				assertion.expected = expected;
			}
			assertions.push(assertion);
			return assertion;
		};
	self.actual = actualValue;
	Object.defineProperty(self, 'not', {get: function () {
		negated = !negated;
		return self;
	}});
	Object.defineProperty(self, 'assertions', {get: function () {
		return assertions.slice(0);
	}});
	Object.defineProperty(self, 'lastAssertion', {get: function () {
		if (assertions.length === 0) {
			return;
		}
		return assertions[assertions.length - 1];
	}});
	self.atPosition = function (position) {
		var last = self.lastAssertion;
		if (last) {
			last.position = position;
		}
		return self;
	};
	self.toEqual = function (expected) {
		self.addAssertion(deepEqual(self.actual, expected), expected);
		return self;
	};

	self.toBeTruthy = function () {
		self.addAssertion(!!self.actual);
		return self;
	};
	self.toBeFalsy = function () {
		self.addAssertion(!self.actual);
		return self;
	};
	self.toBeTrue = function () {
		self.addAssertion(self.actual === true);
		return self;
	};
	self.toBeFalse = function () {
		self.addAssertion(self.actual === false);
		return self;
	};


	self.toBeGreaterThan = function (expected) {
		self.addAssertion(self.actual > expected, expected);
		return self;
	};
	self.toBeLessThan = function (expected) {
		self.expected = expected;
		self.addAssertion(self.actual < expected, expected);
		return self;
	};
	self.toBeGreaterThanOrEqual = function (expected) {
		self.addAssertion(self.actual >= expected, expected);
		return self;
	};
	self.toBeLessThanOrEqual = function (expected) {
		self.addAssertion(self.actual <= expected, expected);
		return self;
	};
	self.toBeBetween = function (range1, range2) {
		self.toBeGreaterThanOrEqual(Math.min(range1, range2)).toBeLessThanOrEqual(Math.max(range1, range2));
		return self;
	};
	self.toBeWithin = function (range1, range2) {
		self.toBeGreaterThan(Math.min(range1, range2)).toBeLessThan(Math.max(range1, range2));
		return self;
	};

};

},{"deep-equal":1}],12:[function(require,module,exports){
/*global module, require */
module.exports = function ExpectationBuilder(stepArgumentArray, matchersArray) {
	'use strict';
	var self = this,
		Expect = require('./expect'),
		expectations = [],
		findPosition = function (expectation) {
			var lastIndex;
			if (expectation.position !== undefined) {
				if (expectation.position >= 0 && expectation.position < stepArgumentArray.length) {
					return expectation.position;
				}
				return;
			}
			lastIndex = stepArgumentArray.lastIndexOf(expectation.expected);
			if (lastIndex >= 0) {
				return lastIndex;
			}
		};
	self.expect = function (actual) {
		var expect = new Expect(actual, matchersArray);
		expectations.push(expect);
		return expect;
	};
	self.getAssertions = function () {
		var assertions = [];
		expectations.forEach(function (expectation) {
			var results = expectation.assertions;
			// console.log('results', results);
			results.forEach(function (result) {
				var position = findPosition(result);
				if (position !== undefined) {
					result.position = position;
				} else {
					delete result.position;
				}
			});
			assertions = assertions.concat(results);
		});
		return assertions;
	};
};

},{"./expect":11}],13:[function(require,module,exports){
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
		var matching, missing, additional;
		array1 = array1 || [];
		array2 = array2 || [];
		matching = array1.filter(function (el) {
			return array2.some(equals, el);
		});
		missing = array1.filter(function (el) {
			return !array2.some(equals, el);
		});
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

},{}],14:[function(require,module,exports){
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
				return crossValueAndExpected(assertion.expected, assertion.actual);
			}
		};
		return {
			position: assertion.position,
			actual: formattedValue()
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
		var forAttachment = function (assertion) {
				return stepResult.attachment && (assertion.position === stepResult.stepArgs.length - 1);
			},
			withoutPosition = function (assertion) {
				return forAttachment(assertion) || (!assertion.position && assertion.position !== 0);
			},
			withPosition = function (assertion) {
				return assertion.position && !forAttachment(assertion);
			},
			failed = function (assertion) {
				return !assertion.passed;
			},
			passed = function (assertion) {
				return assertion.passed;
			},
			notEmpty = function (array) {
				return array && array.length;
			},
			headingLine = function () {
				var noIndexAssertions;
				if (stepResult.exception) {
					return crossValue(stepResult.stepText);
				}
				noIndexAssertions = stepResult.assertions.filter(withoutPosition);
				if (noIndexAssertions.length === 0) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.map(self.formatPrimitiveResult));
				}
				if (noIndexAssertions.some(failed)) {
					if (regexUtil.isListItem(stepResult.stepText)) {
						return regexUtil.getListSymbol(stepResult.stepText) + '**~~' + regexUtil.lineItemContent(stepResult.stepText) + '~~**';
					} else if (regexUtil.isTableItem(stepResult.stepText)) {
						return '| ' + tableUtil.cellValuesForRow(stepResult.stepText).map(crossValue).join(' | ') + ' |';
					} else {
						return crossValue(stepResult.stepText);
					}
				}
				if (stepResult.assertions.some(failed)) {
					return regexUtil.replaceMatchGroup(stepResult.stepText, stepResult.matcher, stepResult.assertions.filter(withPosition).map(self.formatPrimitiveResult));
				}
				if (stepResult.assertions.length) {
					if (regexUtil.isListItem(stepResult.stepText)) {
						return regexUtil.getListSymbol(stepResult.stepText) + '**' + regexUtil.lineItemContent(stepResult.stepText) + '**';
					} else if (regexUtil.isTableItem(stepResult.stepText)) {
						return '| ' + tableUtil.cellValuesForRow(stepResult.stepText).map(boldValue).join(' | ') + ' |';
					} else {
						return boldValue(stepResult.stepText);
					}
				}
				return stepResult.stepText;
			},
			attachmentLines = function () {
				var formatList = function () {
						var innerFormat = function () {
							var failedListAssertions = stepResult.assertions.filter(failed).filter(forAttachment),
							passedListAssertions = stepResult.assertions.filter(passed).filter(forAttachment),
							values = stepResult.attachment.items,
							symbol = stepResult.attachment.symbol || '* ';
							if (notEmpty(failedListAssertions)) {
								values = self.formatListResult(failedListAssertions[0].detail);
							} else if (notEmpty(passedListAssertions)) {
								values = self.formatListResult({matching: stepResult.attachment.items});
							}
							return '\n\n' + symbol + values.join('\n' + symbol);
						};
						if (stepResult.attachment.type !== 'list') {
							return false;
						}
						return innerFormat();
					},
					formatTableItem = function (item) {
						return '|' + item.join('|') + '|';
					},
					formatTable = function () {
						var innerFormat = function () {
							var resultTitles = stepResult.attachment.titles && stepResult.attachment.titles.slice(0),
								failedTableAssertions = stepResult.assertions.filter(failed).filter(forAttachment),
								passedTableAssertions = stepResult.assertions.filter(passed).filter(forAttachment),
								values = stepResult.attachment.items,
								resultRows = [];
							if (notEmpty(failedTableAssertions)) {
								if (resultTitles) {
									resultTitles.unshift('?');
								}
								values = self.getTableResult(failedTableAssertions[0].detail);
							} else if (notEmpty(passedTableAssertions)) {
								if (resultTitles) {
									resultTitles.unshift('?');
								}
								values =  self.getTableResult({matching: stepResult.attachment.items});
							}
							if (resultTitles) {
								resultRows.push(formatTableItem(resultTitles));
								resultRows.push(resultTitles.map(function () {
									return '|-';
								}).join('') + '|');
							}
							resultRows = resultRows.concat(values.map(formatTableItem));
							return '\n\n' + tableUtil.justifyTable(resultRows).join('\n');
						};
						if (stepResult.attachment.type !== 'table') {
							return false;
						}
						return innerFormat();
					};
				if (!stepResult.attachment) {
					return '';
				}
				return formatList() || formatTable();
			},
			exceptionReport = function () {
				if (!stepResult.exception) {
					return '';
				}
				return '\n<!--\n' + (stepResult.exception.stack || stepResult.exception) + '\n-->';
			};
		return headingLine() + attachmentLines() + exceptionReport();
	};
};

},{"./regex-util":21,"./table-util":25}],15:[function(require,module,exports){
/*global module, require*/
module.exports = function MarkdownResultFormatter(runner, globalConfig) {
	'use strict';
	var self = this,
		MarkDownFormatter = require('./markdown-formatter'),
		markDownFormatter = new MarkDownFormatter(),
		resultBuffer = [],
		ResultCountListener = require('./counting-result-listener'),
		resultCountListener = new ResultCountListener(runner),
		tableRows = false,
		TableUtil = require('./table-util'),
		tableUtil = new TableUtil(),
		config = (globalConfig && globalConfig.markdown) || {},
		allowSkipped = globalConfig && globalConfig.allowSkipped,
		skippedLineIndicator = config.skippedLineIndicator || '`skipped`',
		skippedPrepend =  allowSkipped ? '' : skippedLineIndicator + ' ',
		countDescription = function () {
			var labels = ['executed', 'passed', 'failed', 'error', 'skipped'],
				description = '> **In da spec:** ',
				comma = false;

			labels.forEach(function (label) {
				if (resultCountListener.current[label]) {
					if (comma) {
						description = description + ', ';
					} else {
						comma = true;
					}
					description = description + label + ': ' + resultCountListener.current[label];
				}
			});
			if (!comma) {
				description = description + 'Nada';
			}
			return description;
		};
	runner.addEventListener('stepResult', function (result) {
		(tableRows || resultBuffer).push(markDownFormatter.markResult(result));
	});
	runner.addEventListener('nonAssertionLine',  function (line) {
		(tableRows || resultBuffer).push(line);
	});
	runner.addEventListener('skippedLine', function (line) {
		resultBuffer.push(skippedPrepend +  line);
	});
	runner.addEventListener('tableStarted', function () {
		tableRows = [];
	});
	runner.addEventListener('tableEnded', function () {
		if (tableRows) {
			resultBuffer = resultBuffer.concat(tableUtil.justifyTable(tableRows));
		}
		tableRows = false;
	});
	runner.addEventListener('specStarted', function () {
		resultBuffer = [];
	});
	runner.addEventListener('specEnded', function () {
		resultBuffer.unshift('');
		resultBuffer.unshift(countDescription());
	});

	self.formattedResults = function () {
		return resultBuffer.join('\n');
	};

};

},{"./counting-result-listener":6,"./markdown-formatter":14,"./table-util":25}],16:[function(require,module,exports){
/*global module, require*/
module.exports = {
	toEqualSet: function (expected) {
		'use strict';

		var	parseExpected = function () {
				if (!expected) {
					return [];
				}
				if (Array.isArray(expected)) {
					return expected;
				}
				if (expected.items && Array.isArray(expected.items)) {
					return expected.items;
				}
				return [];
			},
			ListUtil = require('../list-util'),
			listUtil = new ListUtil(),
			listResult = listUtil.unorderedMatch(parseExpected(), this.actual);
		this.addAssertion(listResult.matches, expected, listResult);
		return this;
	}
};

},{"../list-util":13}],17:[function(require,module,exports){
/*global module, require*/
module.exports = {
	toEqualUnorderedTable: function (expected) {
		'use strict';
		var TableUtil = require('../table-util'),
			tableUtil = new TableUtil(),
			ListUtil = require('../list-util'),
			listUtil = new ListUtil(),
			actual = this.actual,
			comparisonObject,
			listResult;

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
		listResult = listUtil.unorderedMatch(expected.items, comparisonObject);
		this.addAssertion(listResult.matches, expected, listResult);
		return this;
	}
};

},{"../list-util":13,"../table-util":25}],18:[function(require,module,exports){
/*global module*/
module.exports = function Normaliser() {
	'use strict';
	var self = this;
	self.normaliseString = function (string) {
		return string.toLocaleLowerCase().replace(/\s/g, '');
	};
	self.normaliseObject = function (object) {
		var result = {};
		if (Array.isArray(object)) {
			return object;
		}
		Object.keys(object).forEach(function (key) {
			result[self.normaliseString(key)] = object[key];
		});
		return result;
	};
	self.containsDuplicates = function (stringArray) {
		var normalised, i, j;
		if (!stringArray || !stringArray.length) {
			return false;
		}
		normalised = stringArray.map(self.normaliseString);
		for (i = 0; i < normalised.length - 1; i++) {
			for (j = i + 1; j < normalised.length; j++) {
				if (normalised[i] === normalised[j]) {
					return true;
				}
			}
		}
		return false;
	};
	self.normaliseValue = function (value) {
		var trim = function (val) {
				if (typeof val === 'string') {
					return val.trim();
				}
				return val;
			},
			toNum = function (val) {
				var result;
				if (isNaN(val)) {
					return val;
				}
				result = parseFloat(val);
				if (isNaN(result)) {
					return val;
				}
				return result;
			};
		return toNum(trim(value));
	};
};

},{}],19:[function(require,module,exports){
/*global module, console*/
/*jshint unused:false */
module.exports = function observable(base) {
	'use strict';
	var listeners = [], x;
	base.addEventListener = function (types, listener, priority) {
		types.split(' ').forEach(function (type) {
			if (type) {
				listeners.push({
					type: type,
					listener: listener,
					priority: priority || 0
				});
			}
		});
	};
	base.listeners = function (type) {
		return listeners.filter(function (listenerDetails) {
			return listenerDetails.type === type;
		}).map(function (listenerDetails) {
			return listenerDetails.listener;
		});
	};
	base.removeEventListener = function (type, listener) {
		listeners = listeners.filter(function (details) {
			return details.listener !== listener;
		});
	};
	base.dispatchEvent = function (type) {
		var args = Array.prototype.slice.call(arguments, 1);
		listeners
			.filter(function (listenerDetails) {
				return listenerDetails.type === type;
			})
			.sort(function (firstListenerDetails, secondListenerDetails) {
				return secondListenerDetails.priority - firstListenerDetails.priority;
			})
			.some(function (listenerDetails) {
				try {
					return listenerDetails.listener.apply(undefined, args) === false;
				} catch (e) {
					console.log('dispatchEvent failed', e, listenerDetails);
				}
			});
	};
	return base;
};

},{}],20:[function(require,module,exports){
/*global module, Promise*/
module.exports = function PromisingIterator(objectArray, promiseGenerator) {
	'use strict';
	var self = this,
		resolver,
		rejecter,
		localArrayCopy,
		promiseArray,
		proceed = function () {
			var currentPromise, element;
			if (!localArrayCopy.length) {
				return resolver(promiseArray);
			}
			element = localArrayCopy.shift();
			currentPromise = promiseGenerator(element);
			if (!currentPromise || !currentPromise.then) {
				currentPromise = Promise.resolve(currentPromise);
			}
			promiseArray.push(currentPromise);
			currentPromise.then(proceed, rejecter);
		},
		executor = function (resolve, reject) {
			resolver = resolve;
			rejecter = reject;
			promiseArray = [];
			localArrayCopy = objectArray.slice(0);
			proceed();
		};
	self.iterate = function () {
		return new Promise(executor);
	};
};

},{}],21:[function(require,module,exports){
/*global module, require*/
module.exports = function RegexUtil() {
	'use strict';
	var self = this,
		listSymbolRegex = /^\s*[^\s]+\s+/,
		Normaliser = require('./normaliser'),
		normaliser = new Normaliser();
	this.replaceMatchGroup = function (string, regex, overrides) {
		var everythingInMatchGroups = new RegExp('(' + regex.source.replace(/([^\\]?)[()]/g, '$1)(') + ')'),
				allMatches = string.match(everythingInMatchGroups),
				initial =  string.substring(0, allMatches.index),
				trailing = string.substring(allMatches.index + allMatches[0].length),
				values = allMatches.slice(1);
		overrides.forEach(function (replacement) {
			var findPosition = replacement.position * 2 + 1;
			if (replacement.position >= 0 && findPosition < (values.length - 1)) {
				values[findPosition] = replacement.actual;
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
	this.lineItemContent = function (line) {
		if (!self.isListItem(line)) {
			return line;
		}
		return line.replace(listSymbolRegex, '').trim();
	};
	this.getListSymbol = function (line) {
		if (!self.isListItem(line)) {
			return '';
		}
		return line.match(listSymbolRegex)[0];
	};
	this.assertionLine = function (stepText) {
		var linestartignores = ['#', '\t', '>', '    ', '![', '[', '***', '* * *', '---', '- - -', '===', '= = ='],
			result = true;
		if (stepText.length === 0 || stepText.trim().length === 0) {
			return false;
		}
		linestartignores.forEach(function (lineStart) {
			if (stepText.substring(0, lineStart.length) === lineStart) {
				result = false;
			}
		});
		return result;
	};
	this.regexForTableDataRow = function (cells) {
		var regexTemplate = '\\|',
			cellTemplate = '(.*)\\|',
			i;
		if (!cells || cells < 0) {
			return false;
		}
		for (i = 0; i < cells; i++) {
			regexTemplate = regexTemplate + cellTemplate;
		}
		return new RegExp(regexTemplate);
	};
	this.getMatchedArguments = function (regex, text) {
		var match = text.match(regex);
		if (match) {
			return match.slice(1).map(normaliser.normaliseValue);
		}
		return [];
	};
};

},{"./normaliser":18}],22:[function(require,module,exports){
/*global module, require, Promise*/
module.exports = function Runner(stepFunc, config) {
	'use strict';
	var Context = require('./context'),
		CountingResultListener = require('./counting-result-listener'),
		RegexUtil = require('./regex-util'),
		StepExecutor = require('./step-executor'),
		PromisingIterator = require('./promising-iterator'),
		observable = require('./observable'),
		regexUtil = new RegexUtil(),
		ExampleBlocks = require('./example-blocks'),
		self = observable(this),
		standardMatchers = [require('./matchers/table'), require('./matchers/list')],
		context = new Context();
	self.executeSuite = function (suite) {
		var counts = new CountingResultListener(self),
			executeSpecs = true,
			iterator = new PromisingIterator(suite, function (spec) {
				var specPromise;
				if (!executeSpecs) {
					return;
				}
				if (typeof spec.content === 'function') {
					specPromise = self.execute(spec.content(), spec.name);
				} else {
					specPromise = self.execute(spec.content, spec.name);
				}
				specPromise.then(function () {
					if (config && config.failFast) {
						if (counts.current.error ||  counts.current.failed || (!config.allowSkipped && counts.current.skipped) || !counts.current.passed) {
							executeSpecs = false;
						}
					}
				});
				return specPromise;
			});
		return new Promise(function (resolve, reject) {
			iterator.iterate().then(function () {
				self.dispatchEvent('suiteEnded', counts.total);
				if (counts.total.failed || counts.total.error || (!config.allowSkipped && counts.total.skipped) || !counts.current.passed) {
					return resolve(false);
				}
				resolve(true);
			}, reject);
		});
	};
	self.execute = function (inputText, exampleName) {
		var blocks = new ExampleBlocks(inputText),
			lineNumber = 0,
			counts = new CountingResultListener(self),
			sendLineEvent = function (eventName, line) {
				if (!line && line !== '') {
					self.dispatchEvent(eventName, lineNumber, exampleName);
				} else {
					self.dispatchEvent(eventName, line, lineNumber, exampleName);
				}
			},
			processTableBlock = function (block) {
				var blockLines = block.getMatchText(),
					stepDefinition,
					executor,
					headerLine,
					startNewTable = function (line) {
						stepDefinition = context.getStepDefinitionForLine(line);
						if (!stepDefinition) {
							sendLineEvent('skippedLine', line);
						} else {
							headerLine = line;
							sendLineEvent('tableStarted');
							sendLineEvent('nonAssertionLine', line);
						}
					},
					endCurrentTable = function () {
						if (stepDefinition) {
							sendLineEvent('tableEnded');
							stepDefinition = false;
						}
					};
				return new PromisingIterator(blockLines, function (line) {
					lineNumber++;
					if (!regexUtil.isTableItem(line)) {
						endCurrentTable();
						sendLineEvent('nonAssertionLine', line);
					} else if (!stepDefinition) {
						startNewTable(line);
					} else if (regexUtil.isTableDataRow(line)) {
						executor = new StepExecutor(stepDefinition, context);
						return executor.executeTableRow(line, headerLine).then(function (result) {
							sendLineEvent('stepResult', result);
						});
					} else {
						sendLineEvent('nonAssertionLine', line);
					}
				}).iterate().then(endCurrentTable);
			},
			processBlock = function (block) {
				var blockLines = block.getMatchText(),
					blockParam = block.getAttachment(),
					attachmentLines = block.getAttachmentLines(),
					executor;

				return new PromisingIterator(blockLines, function (line) {
					var stepDefinition;
					lineNumber++;
					if (!regexUtil.assertionLine(line)) { //Move to block?
						if (!blockParam) {
							sendLineEvent('nonAssertionLine', line);
						}
						return;
					}
					stepDefinition = context.getStepDefinitionForLine(line);
					if (!stepDefinition) {
						sendLineEvent('skippedLine', line);
						if (attachmentLines.length) {
							sendLineEvent('nonAssertionLine', '');
							attachmentLines.forEach(function (attachmentLine) {
								lineNumber++;
								sendLineEvent('nonAssertionLine', attachmentLine);
							});
						}
						return;
					}
					executor = new StepExecutor(stepDefinition, context);
					return executor.execute(line, blockParam).then(function (result) {
						sendLineEvent('stepResult', result);
						lineNumber += attachmentLines.length;
					});
				}).iterate();
			};
		self.dispatchEvent('specStarted', exampleName);
		return new PromisingIterator(blocks.getBlocks(), function (block) {
			if (block.isTableBlock()) {
				return processTableBlock(block);
			} else {
				return processBlock(block);
			}
		}).iterate().then(function () {
			self.dispatchEvent('specEnded', exampleName, counts.current);
		});
	};
	context.exportToGlobal();
	standardMatchers.concat((config && config.matchers) || []).forEach(context.addMatchers);
	stepFunc.apply(context, [context]);
	context.resetGlobal();
};

},{"./context":5,"./counting-result-listener":6,"./example-blocks":10,"./matchers/list":16,"./matchers/table":17,"./observable":19,"./promising-iterator":20,"./regex-util":21,"./step-executor":23}],23:[function(require,module,exports){
/*global module, require*/
module.exports = function StepExecutor(stepDefinition, specContext) {
	'use strict';
	var self = this,
		TableUtil = require('./table-util'),
		tableUtil = new TableUtil(),
		RegExUtil = require('./regex-util'),
		Step = require('./step'),
		regexUtil = new RegExUtil();
	self.execute = function (stepText, attachment) {
		var step = new Step(specContext, stepDefinition.processFunction);
		step.stepArgs = regexUtil.getMatchedArguments(stepDefinition.matcher, stepText);
		step.matcher = stepDefinition.matcher;
		step.stepText = stepText;
		step.attachment = attachment;
		if (attachment) {
			step.stepArgs.push(attachment);
		}
		return step.execute();
	};
	self.executeTableRow = function (dataRow, titleRow) {
		var titleMatch = titleRow && titleRow.match(stepDefinition.matcher),
			titleArgs = titleMatch && titleMatch.length > 1 && titleMatch.slice(1).map(function (item) {
				return item.trim();
			}),
			step = new Step(specContext, stepDefinition.processFunction);
		step.stepArgs = tableUtil.cellValuesForRow(dataRow);
		step.matcher = regexUtil.regexForTableDataRow(step.stepArgs.length);
		step.stepText = dataRow;
		if (titleArgs) {
			step.stepArgs = step.stepArgs.concat(titleArgs);
		}
		return step.execute();
	};
};

},{"./regex-util":21,"./step":24,"./table-util":25}],24:[function(require,module,exports){
/*global module, require, Promise */
module.exports = function Step(specContext, processFunction) {
	'use strict';
	var self = this,
		ExpectationBuilder = require('./expectation-builder'),
		makePromise = function (expect) {
			return new Promise(function (resolve, reject) {
				var execResult;
				specContext.overrideGlobal('expect', expect);
				try {
					execResult = processFunction.apply({}, self.stepArgs);
					if (execResult && execResult.then) {
						execResult.then(function () {
							specContext.resetGlobal();
							resolve();
						}, function (reason) {
							specContext.resetGlobal();
							reject(reason);
						});
					} else {
						specContext.resetGlobal();
						resolve();
					}
				} catch (e) {
					specContext.resetGlobal();
					reject(e);
				}
			});
		};
	self.assertions = [];
	if (!specContext || !processFunction) {
		throw new Error('invalid intialisation');
	}

	self.execute = function () {
		var expectationBuilder;
		if (!self.stepArgs) {
			throw new Error('Step args not defined');
		}
		self.assertions = [];
		expectationBuilder = new ExpectationBuilder(self.stepArgs, specContext.getMatchers());

		return new Promise(function (resolve) {
			makePromise(expectationBuilder.expect).then(function () {
				self.assertions = self.assertions.concat(expectationBuilder.getAssertions());
				resolve(self);
			},	function (e) {
				self.exception = e;
				resolve(self);
			});
		});

	};
};

},{"./expectation-builder":12}],25:[function(require,module,exports){
/*global module, require*/
module.exports = function TableUtil() {
	'use strict';
	var self = this,
		RegexUtil = require ('./regex-util'),
		regexUtil = new RegexUtil(),
		Normaliser = require ('./normaliser'),
		normaliser = new Normaliser();

	self.cellValuesForRow = function (dataRow) {
		var values;
		if (!dataRow || dataRow.trim() === '') {
			return [];
		}
		values = dataRow.split('|');
		if (values.length < 3) {
			return [];
		}
		values.pop();
		values =  values.slice(1);
		return values.map(normaliser.normaliseValue);
	};
	self.tableValuesForTitles = function (table, titles) {
		var pickItems = function (tableRow) {
				return columnIndexes.map(function (val) {
					return tableRow[val];
				});
			},
			normalisedTitles,
			normalisedTableTitles,
			columnIndexes;
		if (!titles || titles.length === 0) {
			return false;
		}
		if (!table.titles) {
			return table.items;
		}
		normalisedTitles = titles.map(normaliser.normaliseString);
		normalisedTableTitles = table.titles.map(normaliser.normaliseString);
		columnIndexes = normalisedTitles.map(function (title) {
			return normalisedTableTitles.indexOf(title);
		});
		return table.items.map(pickItems);
	};
	self.objectArrayValuesForTitles = function (list, titles) {
		var normalisedTitles,
			pickItems = function (item) {
				if (Array.isArray(item)) {
					return item;
				}
				return normalisedTitles.map(function (title) {
					return item[title];
				});
			};
		if (!titles || titles.length === 0) {
			return false;
		}
		normalisedTitles = titles.map(normaliser.normaliseString);
		return list.map(normaliser.normaliseObject).map(pickItems);
	};
	self.justifyTable = function (stringArray) {
		var maxCellLengths = function (maxSoFar, tableRow, index) {
				var currentLengths;
				if (dividerRows[index]) {
					return maxSoFar;
				}
				currentLengths = tableRow.map(function (s) {
					return String(s).length;
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
						return ' '  + cellVal + padding(1 + columnLengths[index] - String(cellVal).length, ' ');
					}
				});
			},
			joinCells = function (cells) {
				return '|' + cells.join('|')	+ '|';
			};
		return cellValues.map(padCells).map(joinCells);
	};
};

},{"./normaliser":18,"./regex-util":21}]},{},[8]);
