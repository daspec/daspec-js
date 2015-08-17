/*global module*/
module.exports = function (ctx) {
	'use strict';
	ctx.defineStep(/Simple arithmetic: (\d*) plus (\d*) is (\d*)/, function (firstArg, secondArg, expectedResult) {
		ctx.expect(firstArg + secondArg).toEqual(expectedResult);
	});
	ctx.defineStep(/Simple arithmetic: (\d*) and (\d*) added is (\d*) and multiplied is (\d*)/, function (firstArg, secondArg, expectedAdd, expectedMultiply) {
		ctx.expect(firstArg + secondArg).toEqual(expectedAdd).atPosition(2);
		ctx.expect(firstArg * secondArg).toEqual(expectedMultiply);
	});
	ctx.defineStep(/Multiple Assertions (\d*) is (\d*) and (.*)/, function (num1, num2, lineStatus) {
		ctx.expect(num1).toEqual(num2).atPosition(1);
		ctx.expect(lineStatus === 'passes').toBeTruthy();
	});
	ctx.defineStep(/Multiple Assertions line ([a-z]*) and ([a-z]*)/, function (lineStatus1, lineStatus2) {
		ctx.expect(lineStatus1 === 'passes').toBeTruthy();
		ctx.expect(lineStatus2 === 'passes').toBeTruthy();
	});
	ctx.defineStep(/Star Wars has the following episodes:/, function (listOfEpisodes) {
		var episodes = [
			'A New Hope',
			'The Empire Strikes Back',
			'Return of the Jedi'];
		ctx.expect(episodes).toEqualSet(listOfEpisodes.items);
	});
	var films = {}, tables = {};
	ctx.defineStep(/These are the ([A-Za-z ]*) Films/, function (seriesName, tableOfReleases) {
		films[seriesName] = tableOfReleases.items;
		tables[seriesName] = tableOfReleases;
	});
	ctx.defineStep(/In total there a (\d*) ([A-Za-z ]*) Films/, function (numberOfFilms, seriesName) {
		var actual = (films[seriesName] && films[seriesName].length) || 0;
		ctx.expect(actual).toEqual(numberOfFilms);
	});
	ctx.defineStep(/Good ([A-Za-z ]*) Films are/, function (seriesName, listOfEpisodes) {
		var actual = films[seriesName];
		ctx.expect(actual).toEqualSet(listOfEpisodes.items);
	});
	ctx.defineStep(/Check ([A-Za-z ]*) Films/, function (seriesName, listOfEpisodes) {
		this.assertUnorderedTableEquals(listOfEpisodes, tables[seriesName]);
	});
	ctx.defineStep(/List can contain sub lists/, function () {

	});
	ctx.defineStep(/\|([A-Za-z ]*) episode \| Year of release \|/, function (episode, yearOfRelease, seriesName) {
		var series = films[seriesName],
			matching = series && series.filter(function (film) {
				return film[0] === episode;
			}),
			actualYear = matching && matching.length > 0 && matching[0][1];
		ctx.expect(series).toBeTruthy();
		ctx.expect(!!matching && matching.length).toBeTruthy();
		ctx.expect(actualYear).toEqual(yearOfRelease);
	});

	ctx.defineStep(/\| Positional Check episodes of ([A-Za-z ]*) \| Year of release \|/, function (episode, yearOfRelease, seriesName) {
		var series = films[seriesName],
			matching = series && series.filter(function (film) {
				return film[0] === episode;
			}),
			actualYear = matching && matching.length > 0 && matching[0][1];
		ctx.expect(actualYear).toEqual(yearOfRelease).atPosition(1);
	});

};
