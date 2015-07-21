//jshint node:true
'use strict';

var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    del = require('del'),
    KarmaServer = require('karma').Server;
var js = 'src/js/**/*.js';
gulp.task('compilejs', function () {
    return gulp.src(js)
        .pipe(sourcemaps.init())
        .pipe(babel({
            modules: 'amd',
            moduleRoot: './'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('karma', function (done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
});

gulp.task('server', function () {
    connect.server({
        root: ['example', 'bower_components', 'dist']
    });
});

gulp.task('watch', function () {
    gulp.watch([js], ['del:dist', 'compilejs']);
});

gulp.task('del:dist', function (done) {
    del([
        'dist/**/*'
    ], done);
});

gulp.task('default', ['del:dist', 'compilejs', 'server', 'watch']);
