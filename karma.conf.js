//jshint node:true

var istanbul = require('browserify-istanbul');
var isparta = require('isparta');


module.exports = function(config) {
    'use strict';
    config.set({
        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'src/js/**/*.js',
            'test/**/*.js'
        ],
        frameworks: ['browserify', 'mocha', 'chai-sinon'],
        browsers: ['Chrome'],
        preprocessors: {
            'src/**/*.js': ['browserify'],
            'test/**/*.js': ['browserify']
        },
        reporters: ['mocha', 'notify', 'coverage'],
        customLaunchers: {
            ChromeTravis: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
        coverageReporter: {
            reporters: [
                { type: 'html', subdir: 'chrome'},
                { type: 'lcov', subdir: 'chrome-lcov' },
            ]
        },
        browserify: {
            debug: true,
            transform: [istanbul({
                instrumenter: require('isparta'),
                ignore: ['test/**/*.js']
            }), 'babelify']
        }
    });

    if (process.env.TRAVIS) {
        config.browsers = ['ChromeTravis'];
    }
};
