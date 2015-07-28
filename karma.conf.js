//jshint node:true
module.exports = function (config) {
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
        reporters: ['mocha', 'notify'],
        customLaunchers: {
            ChromeTravis: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
        browserify: {
            debug: true,
            transform: ['babelify']
        }
    });

    if (process.env.TRAVIS) {
        config.browsers = ['ChromeTravis'];
    }
};
