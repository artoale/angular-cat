//jshint node:true
'use strict';

var gulp = require('gulp'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    connect = require('gulp-connect'),
    del = require('del'),
    source = require('vinyl-source-stream'),
    exorcist   = require('exorcist'),
    KarmaServer = require('karma').Server,
    uglify = require('gulp-uglify'),
    streamify = require('gulp-streamify'),
    js = 'src/js/**/*.js';

gulp.task('compilejs', function () {
    return browserify('src/js/paAnimations.js', {
            debug: true
        })
        .transform(babelify)
        .bundle()
        .on('error', function (err) {
            console.log('Error : ' + err.message);
        })
        .pipe(exorcist('dist/src/paAnimations.js.map'))
        .pipe(source('paAnimations.min.js'))
        .pipe(gulp.dest('dist/src'));
});

gulp.task('build', function () {
    return browserify('src/js/paAnimations.js')
        .transform(babelify)
        .bundle()
        .on('error', function (err) {
            console.log('Error : ' + err.message);
        })
        .pipe(source('paAnimations.min.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('dist/build'));
});



gulp.task('karma', function (done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
});

gulp.task('server', function () {
    connect.server({
        root: ['example', 'bower_components', 'dist/src']
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
