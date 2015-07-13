/*global module*/
module.exports = function (grunt) {
	'use strict';
	grunt.initConfig({
		notify: {
			jasmine: {
				options: {
					title: 'Daspec-JS Jasmine Tests',
					message: 'jasmine test success'
				}
			}
		},
		watch: {
			specs: {
				files: ['test/**/*.js'],
				tasks: ['jasmine'],
				options: {
					spawn: false
				}
			},
			src: {
				files: ['src/**/*.js'],
				tasks: ['jasmine', 'notify:jasmine'],
				options: {
					spawn: false
				}

			}
		},
		jscs: {
			src: ['src/**/*.js', 'test/**/*.js'],
			options: {
				config: '.jscsrc',
				reporter: 'inline'
			}
		},
		jshint: {
			all: ['src/**/*.js', 'test/**/*.js'],
			options: {
				jshintrc: true
			}
		},
		jasmine: {
			all: {
				src: ['src/daspec.js', 'src/*/*.js'],
				options: {
					outfile: 'SpecRunner.html',
					specs: 'test/*-spec.js',
					keepRunner: true,
					display: 'short'
				}
			}
		}
	});
	grunt.registerTask('checkstyle', ['jshint', 'jscs']);
	grunt.registerTask('precommit', ['checkstyle', 'jasmine']);

	// Load local tasks.
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-notify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.event.on('watch', function (action, filepath, target) {
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
		var options = grunt.config(['jasmine', 'all']);
		if (target === 'specs') {
			options.options.specs = [filepath];
		} else {
			options.options.specs = ['test/*-spec.js'];
		}
		grunt.config(['jasmine', 'all'], options);

	});
};
