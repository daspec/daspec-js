/*global module*/
module.exports = function (ctx) {
	'use strict';
	ctx.defineStep(/Simple arithmetic: (\d*) plus (\d*) is (\d*)/, function (firstArg, secondArg, expectedResult) {
		ctx.assertEquals(expectedResult, parseFloat(firstArg) + parseFloat(secondArg), 2);
	});
	ctx.defineStep(/Simple arithmetic: (\d*) and (\d*) added is (\d*) and multiplied is (\d*)/, function (firstArg, secondArg, expectedAdd, expectedMultiply) {
		ctx.assertEquals(expectedAdd, parseFloat(firstArg) + parseFloat(secondArg), 2);
		ctx.assertEquals(expectedMultiply, parseFloat(firstArg) * parseFloat(secondArg), 3);
	});
	ctx.defineStep(/Multiple Assertions (\d*) is (\d*) and (.*)/, function (num1, num2, lineStatus) {
		ctx.assertEquals(num2, num1, 1);
		ctx.assertEquals(lineStatus, 'passes');
	});
	ctx.defineStep(/Multiple Assertions line ([a-z]*) and ([a-z]*)/, function (lineStatus1, lineStatus2) {
		ctx.assertEquals(lineStatus1, 'passes');
		ctx.assertEquals(lineStatus2, 'passes');
	});
	ctx.defineStep(/Star Wars has the following episodes:/, function (listOfEpisodes) {
		var episodes = [
			'A New Hope',
			'The Empire Strikes Back',
			'Return of the Jedi'];
		ctx.assertSetEquals(listOfEpisodes.items, episodes);
	});
};
