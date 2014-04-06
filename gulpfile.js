var gulp = require('gulp');
var gulpif = require('gulp-if');
var rename = require("gulp-rename");

var ngmin = require('gulp-ngmin');

gulp.task('scripts', function () {
    var jsStream = gulp.src("./public/index.html")
        .pipe(require("gulp-assets").js())
        .pipe(gulpif(/^(?:(?!vendor).)*$/, ngmin()))
        .pipe(gulpif(/socket\.js$/, ngmin()));

    var tplStream = gulp.src(['public/**/*.html', '!public/vendor/**/*', '!public/index.html'])
        .pipe(require('gulp-angular-templatecache')({
            module: 'chatApp'
        }));

    require('event-stream').merge(jsStream, tplStream)
        .pipe(require('gulp-concat')('all.min.js'))
        .pipe(require('gulp-uglify')())
        .pipe(gulp.dest('build'));
});

gulp.task('styles', function () {
    gulp.src('./public/main.less')
        .pipe(require('gulp-less')({
            paths: ['./public']
        }))
        .pipe(require('gulp-csso')())
        .pipe(rename('all.min.css'))
        .pipe(gulp.dest('build'));
});

gulp.task('html', function () {
    gulp.src('./public/index.html')
        .pipe(require('gulp-html-replace')({
            'css': 'all.min.css',
            'twbsCss': 'vendor/bootstrap/dist/css/bootstrap.min.css',
            'js': 'all.min.js'
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('copy', function () {
    gulp.src('./public/vendor/bootstrap/dist/**/*')
        .pipe(gulp.dest('build/vendor/bootstrap/dist'));
    gulp.src('./public/emoji/emoji.png')
        .pipe(gulp.dest('build'));
});

gulp.task('default', ['scripts', 'styles', 'html', 'copy']);
