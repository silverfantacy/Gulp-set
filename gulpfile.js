var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();

//Jade
gulp.task('jade', function () {
    gulp.src('./source/**/*.jade')
        .pipe($.plumber())
        .pipe($.jade({
            pretty: true // 無壓縮
        }))
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream()); //輸出後重新整理
});

//SASS
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
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream());
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
        .pipe(gulp.dest('./public/js'))
        .pipe(browserSync.stream());
});

//Bower 取得檔案
gulp.task('bower', function() {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest('./.tmp/vendors'))
    return gulp.src(mainBowerFiles({
        "overrides": {
            "vue": {                       // 套件名稱
                "main": "dist/vue.js"      // 取用的資料夾路徑
            }
        }
    }))
        .pipe(gulp.dest('./.tmp/vendors'));
        cb(err);
});

//Bower 整合檔案
gulp.task('vendorJs', ['bower'], function(){  // [優先執行的排程]
    return gulp.src('./.tmp/vendors/**/**.js')
        .pipe($.concat('vendors.js'))//合併js
        .pipe(gulp.dest('./public/js'));
})

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
});

//監控
gulp.task('watch', function () {
    gulp.watch('./source/scss/**/*.scss', ['sass']);
    gulp.watch('./source/scss/**/*.sass', ['sass']);
    gulp.watch('./source/**/*.jade', ['jade']);
    gulp.watch('./source/js/**/*.js', ['babel']);
});
//依序執行
gulp.task('default', ['jade', 'sass', 'babel', 'vendorJs', 'browser-sync', 'watch']);