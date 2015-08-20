/*global module*/
module.exports = function Normaliser() {
	'use strict';
	var self = this;
	self.normaliseString = function (string) {
		return string.toLocaleLowerCase().replace(/\s/g, '');
	};
	self.normaliseObject = function (object) {
		if (Array.isArray(object)) {
			return object;
		}
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
	self.normaliseValue = function (value) {
		var trim = function (val) {
				if (typeof val === 'string') {
					return val.trim();
				}
				return val;
			},
			toNum = function (val) {
				if (isNaN(val)) {
					return val;
				}
				var result = parseFloat(val);
				if (isNaN(result)) {
					return val;
				}
				return result;
			};
		return toNum(trim(value));
	};
};
