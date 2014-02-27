module.exports = function(grunt) {

	'use strict';

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),


		// License banner //
		banner: '/*! \n' +
			' * <%= pkg.name %>\n' +
			' * Copyright 2013-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
			' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
			' */\n',


		// LESS compilation options
		less: {
			dist: {
				files: {
					'dist/css/swif.css': 'css/startup.less'
				},
				options: {
					compress: true,
					cleancss: true
				}
			}
		},

		targethtml: {
			dist: {
				files: {
					'dist/index.html': 'index.html'
				}
			}
		},

		copy: {
			dist: {
				files: {
					'dist/': [
						'startup.js',
						'app-interventions/**',
						'app-reservations/**',
						'fonts/**',
						'js/*.js',
						'js/**/*.js',
						'js/libs/**.js',
						'i18n/**',
						'templates/**',
						'config/*',
						'properties.json',
						'font/*',
						'css/vendors/*.css',
						'css/images/**'
					]
				}
			}
		},

		// Check JS Files //
		jshint: {
			options: {
				strict       : true,
				unused       : true,
				quotmark     : 'single',
				indent       : 4,
				undef        : true,
				noempty      : true,
				freeze       : true,
				curly        : true,
				latedef      : true,
				maxcomplexity: 15,
				trailing     : true,
				browser      : true,
				jquery       : true,
				devel        : true,
				globals      : { 'requirejs': true, 'require': true, 'module': true, 'define': true, '_': true, 'Backbone': true }
			},
			gruntfile: {
				src: ['Gruntfile.js']
			},
			jsonFile: {
				options: {
					quotmark: 'double'
				},
				src: ['properties.json', 'package.json', 'config/*.json.*', 'i18n/**/*.json', 'app-interventions/config/*.json', 'app-reservations/config/*.json'],
			},
			scripts_main: {
				src: ['js/**/*.js', '!js/libs/*', '!js/i18n/*']
			},
			scripts_inter: {
				src: ['app-interventions/js/**/*.js', 'app-interventions/main.js']
			},
			scripts_resa: {
				//src: ['app-reservations/js/**/*.js', 'app-reservations/main.js']
				src: ['app-reservations/main.js', 'app-reservations/js/routers/*.js', 'app-reservations/js/models/*.js', 'app-reservations/js/collections/*.js']
			},

		},

		// Check Style JS File
		jscs: {
			options: {
				'disallowKeywords'                        : ['with'],
				'requireLeftStickedOperators'             : [','],
				'disallowLeftStickedOperators'            : ['?', '+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<='],
				'disallowRightStickedOperators'           : ['?', '/', '*', ':', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<='],
				'disallowSpaceAfterPrefixUnaryOperators'  : ['++', '--', '+', '-', '~'],
				'disallowSpaceBeforePostfixUnaryOperators': ['++', '--'],
				'requireRightStickedOperators'            : ['!'],
				'requireSpaceAfterBinaryOperators'        : ['+', '-', '/', '*', '=', '==', '===', '!=', '!=='],
				'requireSpaceAfterKeywords'               : ['if', 'else', 'for', 'while', 'do', 'switch', 'return', 'try', 'catch'],
				'requireSpaceBeforeBinaryOperators'       : ['+', '-', '/', '*', '=', '==', '===', '!=', '!=='],
				'requireSpacesInFunctionExpression'       : { 'beforeOpeningCurlyBrace': true },
				'requireKeywordsOnNewLine'                : ['else'],
				'disallowSpacesInFunctionExpression'      : { 'beforeOpeningRoundBrace': true },
				'validateLineBreaks'                      : 'LF',
				'force': true
			},
			gruntfile: {
				src: ['Gruntfile.js']
			},
			scripts: {
				src: ['app-interventions/js/views/lists/RequestsListView.js']
			}
		},

		// Add licence to the files //
		usebanner: {
			default: {
				options: {
					position: 'top',
					banner  : '<%= banner %>'
				},
				files: {
					src: ['js/**/*.js', '!js/libs/*', '!js/i18n/*', 'app-interventions/**/*.js', 'app-reservations/**/*.js', '**/*.less', '!css/vendors/**/*.less']
				}
			}
		},

		// Create AUTHORS file //
		contributors: {
			master: {
				branch: 'master',
				chronologically: true
			}
		},

		// Hooks to run check task before each commit //
		githooks: {
			all: {
				'pre-commit': 'check',
			}
		},

		// Display notifications messages //
		notify: {
			check: {
				options: {
					title  : 'Check done without error',
					message: 'Changes can be commited and pushed!'
				}
			}
		},
		notify_hooks: {
			options: {
				enabled: true,
				max_jshint_notifications: 0
			}
		}

	});



	/** Check if the version in package.json and properties.json are equal
	*   && if the package version are equal to the last git Tag
	*/
	grunt.registerTask('checkVersion', 'Check if the version in package.json and properties.json are equal', function() {

		// Require semver //
		var semver = require('semver');


		// Get the Semver version in the package file //
		var packageVersion = grunt.file.readJSON('package.json').version;

		// Get the Semver version in the properties file //
		var propertiesVersion = grunt.file.readJSON('properties.json').version;

		// Get the last Git Tag version //
		var shell = require('shelljs');
		var cmdOutput = shell.exec('git describe --tags `git rev-list --tags --max-count=1`', {'silent': true});

		if (cmdOutput.code !== 0){
			grunt.fail.fatal('Git software are require');
		}

		var lastTagVersion = cmdOutput.output.replace(/(\r\n|\n|\r)/gm, '');


		// Check if the last Git Tag is correct //
		if (!semver.valid(lastTagVersion)){
			grunt.fail.warn('Last Git tag Version is not correct');
			grunt.log.error(lastTagVersion);
		}

		// Check if the properties.json version is correct //
		if (!semver.valid(propertiesVersion)){
			grunt.fail.warn('Version in properties.json file is not correct');
			grunt.log.error(propertiesVersion);
		}

		// Check if the package.json version is correct //
		if (!semver.valid(packageVersion)){
			grunt.fail.warn('Version in package.json file is not correct');
			grunt.log.error(packageVersion);
		}



		// Check if the package.json version and properties.json version are equal //
		if (packageVersion !== propertiesVersion){
			grunt.fail.warn('Versions in properties.json and package.json are not equal');
			grunt.log.error(packageVersion + ' != ' + propertiesVersion);
		}


		if (semver.gt(lastTagVersion, packageVersion)){
			grunt.fail.warn('App version are lower than the last Git tag');
			grunt.log.error(packageVersion + ' != ' + lastTagVersion);
		}
		else if (semver.lt(lastTagVersion, packageVersion)){
			grunt.fail.warn('App version are greater than the last Git tag');
			grunt.log.error(packageVersion + ' != ' + lastTagVersion);
		}


		grunt.log.writeln('Check version done without error.'.green);
		grunt.log.ok('App version ' + propertiesVersion);

	});



	// Load the Tasks //
	require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});
	grunt.task.run('notify_hooks');


	grunt.registerTask('default', ['checkVersion', 'less', 'targethtml', 'copy']);
	grunt.registerTask('check', ['jshint', 'checkVersion', 'notify:check']);
};