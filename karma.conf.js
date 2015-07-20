//jshint node:true
module.exports = function (config) {
    'use strict';

    config.set({
        files: [
            'src/js/**/*.js',
            'test/**/*.js',
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-mocks/angular-mocks.js'
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
