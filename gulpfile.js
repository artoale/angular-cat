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
    runSequence = require('run-sequence'),
    js = 'src/js/**/*.js',

    compileJs = function (dist) {
        var dest = dist ? 'dist' : 'example';
        return browserify('src/js/cat.js', {
                debug: true
            })
            .transform(babelify)
            .bundle()
            .on('error', function (err) {
                console.log('Error : ' + err.message);
            })
            .pipe(exorcist(dest + '/cat.js.map'))
            .pipe(source('cat.js'))
            .pipe(gulp.dest(dest));
    };

gulp.task('compilejs', function () {
    compileJs(true);
});

gulp.task('compilejs-dev', function () {
    compileJs(false);
});

gulp.task('build', function () {
    return browserify('src/js/cat.js')
        .transform(babelify)
        .bundle()
        .on('error', function (err) {
            console.log('Error : ' + err.message);
        })
        .pipe(source('cat.min.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('dist'));
});

gulp.task('karma', function (done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
});

gulp.task('server', function () {
    connect.server({
        root: ['example', 'bower_components']
    });
});

gulp.task('watch', function () {
    gulp.watch([js], ['compilejs']);
});

gulp.task('del:dist', function (done) {
    del([
        'dist/**/*'
    ], done);
});

gulp.task('deploy', function (cb) {
    runSequence('del:dist', 'compilejs', 'build', cb);
});

gulp.task('default', ['compilejs-dev', 'server', 'watch']);
