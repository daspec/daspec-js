/*global module, defineStep, expect*/
module.exports = function () {
	'use strict';
	defineStep(/Simple arithmetic: (\d*) plus (\d*) is (\d*)/, function (firstArg, secondArg, expectedResult) {
		expect(firstArg + secondArg).toEqual(expectedResult);
	});
	defineStep(/Simple arithmetic: (\d*) and (\d*) added is (\d*) and multiplied is (\d*)/, function (firstArg, secondArg, expectedAdd, expectedMultiply) {
		this.assertEquals(expectedAdd, parseFloat(firstArg) + parseFloat(secondArg), 2);
		this.assertEquals(expectedMultiply, parseFloat(firstArg) * parseFloat(secondArg), 3);
	});
	defineStep(/Multiple Assertions (\d*) is (\d*) and (.*)/, function (num1, num2, lineStatus) {
		this.assertEquals(num2, num1, 1);
		this.assertEquals(lineStatus, 'passes');
	});
	defineStep(/Multiple Assertions line ([a-z]*) and ([a-z]*)/, function (lineStatus1, lineStatus2) {
		this.assertEquals(lineStatus1, 'passes');
		this.assertEquals(lineStatus2, 'passes');
	});
	defineStep(/Star Wars has the following episodes:/, function (listOfEpisodes) {
		var episodes = [
			'A New Hope',
			'The Empire Strikes Back',
			'Return of the Jedi'];
		this.assertSetEquals(listOfEpisodes.items, episodes);
	});
	var films = {}, tables = {};
	defineStep(/These are the ([A-Za-z ]*) Films/, function (seriesName, tableOfReleases) {
		films[seriesName] = tableOfReleases.items;
		tables[seriesName] = tableOfReleases;
	});
	defineStep(/In total there a (\d*) ([A-Za-z ]*) Films/, function (numberOfFilms, seriesName) {
		var actual = (films[seriesName] && films[seriesName].length) || 0;
		this.assertEquals(parseFloat(numberOfFilms), actual, 0);
	});
	defineStep(/Good ([A-Za-z ]*) Films are/, function (seriesName, listOfEpisodes) {
		var actual = films[seriesName];
		this.assertSetEquals(listOfEpisodes.items, actual);
	});
	defineStep(/Check ([A-Za-z ]*) Films/, function (seriesName, listOfEpisodes) {
		this.assertUnorderedTableEquals(listOfEpisodes, tables[seriesName]);
	});
	defineStep(/List can contain sub lists/, function () {

	});
	defineStep(/\|([A-Za-z ]*) episode \| Year of release \|/, function (episode, yearOfRelease, seriesName) {
		var series = films[seriesName],
			matching = series && series.filter(function (film) {
				return film[0] === episode;
			}),
			actualYear = matching && matching.length > 0 && matching[0][1];
		this.assertEquals(true, !!series);
		this.assertEquals(true, !!matching && matching.length);
		this.assertEquals(yearOfRelease, actualYear, 1);
	});

	defineStep(/\| Positional Check episodes of ([A-Za-z ]*) \| Year of release \|/, function (episode, yearOfRelease, seriesName) {
		var series = films[seriesName],
			matching = series && series.filter(function (film) {
				return film[0] === episode;
			}),
			actualYear = matching && matching.length > 0 && matching[0][1];
		this.assertEquals(yearOfRelease, actualYear, 1);
	});

};
