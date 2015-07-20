//jshint node:true
'use strict';

var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    karmaServer = require('karma').Server;

gulp.task('default', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            modules: 'amd'
        }))
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('karma', function(done) {
    new karmaServer({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
});
