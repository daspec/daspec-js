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
{type:'table', titles: ['Title', 'Year'], items:[
	['A new Hope', 1976],
	['The Empire Strikes Back', 1979],
	...
]]}
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
		films[seriesName] = tableOfReleases.items;
	});
	ctx.defineStep(/In total there a (\d*) ([A-Za-z ]*) Films/, function (numberOfFilms, seriesName) {
		var actual = (films[seriesName] && films[seriesName].length) || 0;
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
