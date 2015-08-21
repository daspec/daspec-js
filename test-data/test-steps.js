/*global module, expect, defineStep*/
module.exports = function () {
	'use strict';
	defineStep(/Simple arithmetic: (\d*) plus (\d*) is (\d*)/, function (firstArg, secondArg, expectedResult) {
		expect(firstArg + secondArg).toEqual(expectedResult);
	});
	defineStep(/Simple arithmetic: (\d*) and (\d*) added is (\d*) and multiplied is (\d*)/, function (firstArg, secondArg, expectedAdd, expectedMultiply) {
		expect(firstArg + secondArg).toEqual(expectedAdd).atPosition(2);
		expect(firstArg * secondArg).toEqual(expectedMultiply);
	});
	defineStep(/Multiple Assertions (\d*) is (\d*) and (.*)/, function (num1, num2, lineStatus) {
		expect(num1).toEqual(num2).atPosition(1);
		expect(lineStatus === 'passes').toBeTruthy();
	});
	defineStep(/Multiple Assertions line ([a-z]*) and ([a-z]*)/, function (lineStatus1, lineStatus2) {
		expect(lineStatus1 === 'passes').toBeTruthy();
		expect(lineStatus2 === 'passes').toBeTruthy();
	});
	defineStep(/Star Wars has the following episodes:/, function (listOfEpisodes) {
		var episodes = [
			'A New Hope',
			'The Empire Strikes Back',
			'Return of the Jedi'];
		expect(episodes).toEqualSet(listOfEpisodes);
	});
	var films = {}, tables = {};
	defineStep(/These are the ([A-Za-z ]*) Films/, function (seriesName, tableOfReleases) {
		films[seriesName] = tableOfReleases.items;
		tables[seriesName] = tableOfReleases;
	});
	defineStep(/In total there a (\d*) ([A-Za-z ]*) Films/, function (numberOfFilms, seriesName) {
		var actual = (films[seriesName] && films[seriesName].length) || 0;
		expect(actual).toEqual(numberOfFilms);
	});
	defineStep(/Good ([A-Za-z ]*) Films are/, function (seriesName, listOfEpisodes) {
		var actual = films[seriesName];
		expect(actual).toEqualSet(listOfEpisodes);
	});

	defineStep(/Years of ([A-Za-z ]*) Films are/, function (seriesName, listOfEpisodes) {
		var actual = films[seriesName].map(function (film) {
			return [film[1]];
		});
		expect(actual).toEqualUnorderedTable(listOfEpisodes);
	});

	defineStep(/Check ([A-Za-z ]*) Films/, function (seriesName, listOfEpisodes) {
		expect(tables[seriesName]).toEqualUnorderedTable(listOfEpisodes);
	});
	defineStep(/List can contain sub lists/, function () {

	});
	defineStep(/\|([A-Za-z ]*) episode \| Year of release \|/, function (episode, yearOfRelease, seriesName) {
		var series = films[seriesName],
			matching = series && series.filter(function (film) {
				return film[0] === episode;
			}),
			actualYear = matching && matching.length > 0 && matching[0][1];
		expect(series).toBeTruthy();
		expect(!!matching && matching.length).toBeTruthy();
		expect(actualYear).toEqual(yearOfRelease);
	});

	defineStep(/\| Positional Check episodes of ([A-Za-z ]*) \| Year of release \|/, function (episode, yearOfRelease, seriesName) {
		var series = films[seriesName],
			matching = series && series.filter(function (film) {
				return film[0] === episode;
			}),
			actualYear = matching && matching.length > 0 && matching[0][1];
		expect(actualYear).toEqual(yearOfRelease).atPosition(1);
	});

};
