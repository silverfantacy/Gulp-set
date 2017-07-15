var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var mainBowerFiles = require('main-bower-files');

gulp.task('jade', function () {
    gulp.src('./source/**/*.jade')
        .pipe($.plumber())
        .pipe($.jade({
            pretty: true // 無壓縮
        }))
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
        .pipe($.sourcemaps.init()) //顯示檔案位置
        .pipe($.sass().on('error', $.sass.logError))
        // 編譯完成 CSS
        .pipe($.postcss(plugins))
        .pipe($.sourcemaps.write('.')) //顯示檔案位置
        .pipe(gulp.dest('./public/css'));
});

//ES6
gulp.task('babel', () => {
    return gulp.src('./source/js/**/*.js')
        .pipe($.sourcemaps.init())//顯示檔案位置
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe($.concat('all.js')) //合併js
        .pipe($.sourcemaps.write('.')) //顯示檔案位置
        .pipe(gulp.dest('./public/js'));
});

gulp.task('bower', function() {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest('./.tmp/vendors'))
});

gulp.task('vendorJs', ['bower'], function(){  // [優先執行的排程]
    return gulp.src('./.tmp/vendors/**/**.js')
        .pipe($.concat('vendors.js'))//合併js
        .pipe(gulp.dest('./public/js'));
})

//監控
gulp.task('watch', function () {
    gulp.watch('./source/scss/**/*.scss', ['sass']);
    gulp.watch('./source/scss/**/*.sass', ['sass']);
    gulp.watch('./source/**/*.jade', ['jade']);
    gulp.watch('./source/js/**/*.js', ['babel']);
});
//依序執行
gulp.task('default', ['jade', 'sass', 'babel', 'vendorJs', 'watch']);