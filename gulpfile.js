var gulp = require('gulp');
var gulpif = require('gulp-if');
var rename = require("gulp-rename");
var es = require('event-stream');
var ngmin = require('gulp-ngmin');

gulp.task('scripts', function () {
    var jsStream = gulp.src("./public/index.html")
        .pipe(require("gulp-assets").js())
        .pipe(gulpif(/^(?:(?!vendor).)*$/, ngmin()));

    var tplStream = gulp.src(['public/**/*.html', '!public/vendor/**/*', '!public/index.html'])
        .pipe(require('gulp-angular-templatecache')({
            module: 'chatApp'
        }));

    return es.merge(jsStream, tplStream)
        .pipe(require('gulp-concat')('all.min.js'))
        .pipe(require('gulp-uglify')())
        .pipe(gulp.dest('build'));
});

gulp.task('styles', function () {
    return gulp.src('./public/main.less')
        .pipe(require('gulp-less')({
            paths: ['./public']
        }))
        .pipe(require('gulp-csso')())
        .pipe(rename('all.min.css'))
        .pipe(gulp.dest('build'));
});

gulp.task('html', function () {
    return gulp.src('./public/index.html')
        .pipe(require('gulp-html-replace')({
            'css': 'all.min.css',
            'twbsCss': 'vendor/bootstrap/dist/css/bootstrap.min.css',
            'js': 'all.min.js'
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('copy', function () {
    return es.merge(
        gulp.src('./public/vendor/bootstrap/dist/**/*')
            .pipe(gulp.dest('build/vendor/bootstrap/dist')),
        gulp.src('./public/emoji/emoji.{png,css}')
            .pipe(gulp.dest('build/emoji'))
    );
});

gulp.task('default', ['scripts', 'styles', 'html', 'copy']);
