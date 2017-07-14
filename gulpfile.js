var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');


gulp.task('jade', function () {
    gulp.src('./source/**/*.jade')
        .pipe($.plumber())
        // .pipe($.jade({
        //     pretty: true // 無壓縮
        // }))
        .pipe(gulp.dest('./public/'))
});

gulp.task('sass', function () {
    var plugins = [
        autoprefixer({
            browsers: ['last 2 version', '> 5%', 'ie 8']
        }),
    ];
    return gulp.src(['./source/scss/**/*.sass', './source/scss/**/*.scss'])
        .pipe($.plumber())
        .pipe($.sass().on('error', $.sass.logError))
        // 編譯完成 CSS
        .pipe($.postcss(plugins))
        .pipe(gulp.dest('./public/css'));
});

//監控
gulp.task('watch', function () {
    gulp.watch('./source/scss/**/*.scss', ['sass']);
    gulp.watch('./source/scss/**/*.sass', ['sass']);
    gulp.watch('./source/**/*.jade', ['jade']);
});
//依序執行
gulp.task('default', ['jade', 'sass', 'watch']);