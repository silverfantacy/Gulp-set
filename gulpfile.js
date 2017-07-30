var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();
var minimist = require('minimist');
var gulpSequence = require('gulp-sequence');

var envOptions = {
    string: 'env', 
    default: { env: 'develop'} //環境
}

var options = minimist(process.argv.slice(2), envOptions)

//清除
gulp.task('clean', function () {
    return gulp.src(['./.tmp', './public'], {read: false})
        .pipe($.clean());
});

//Jade
gulp.task('jade', function () {
    gulp.src('./source/**/*.jade')
        .pipe($.plumber())
        .pipe($.data(function(){
            // var khData = require('./source/data/data.json');
            var area = require('./source/data/areaList.json');
            var source = {
                // 'khData': khData,
                'area': area 
            };
            return source;
        }))
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
        .pipe($.if(options.env === 'production', $.minifyCss()))
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
        .pipe($.if(options.env === 'production', $.uglify({
            compress: {
                drop_console: true //放棄console
            }
        })))
        .pipe($.sourcemaps.write('.')) //顯示檔案位置
        .pipe(gulp.dest('./public/js'))
        .pipe(browserSync.stream());
});

//Bower 取得檔案
gulp.task('bower', function() {
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
        .pipe($.order([
            'jquery.js',
            'tether.js',
            'bootstrap.js',
            'vue.js',
            '**/*.js'
        ]))
        .pipe($.concat('vendors.js'))//合併js
        .pipe($.if(options.env === 'production', $.uglify()))
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

//壓縮圖片
gulp.task('image-min', () =>
    gulp.src('./source/images/*')
        .pipe($.if(options.env === 'production', $.imagemin())) //產品化時再壓縮
        .pipe(gulp.dest('./public/images'))
);

//監控
gulp.task('watch', function () {
    gulp.watch('./source/scss/**/*.scss', ['sass']);
    gulp.watch('./source/scss/**/*.sass', ['sass']);
    gulp.watch('./source/**/*.jade', ['jade']);
    gulp.watch('./source/js/**/*.js', ['babel']);
});

//Github
gulp.task('deploy', function() {
  return gulp.src('./public/**/*')
    .pipe($.ghPages());
});

//發佈流程
gulp.task('build', gulpSequence('clean', 'jade', 'sass', 'babel', 'vendorJs', 'image-min'))

//依序執行
gulp.task('default', ['jade', 'sass', 'babel', 'vendorJs', 'browser-sync', 'image-min', 'watch']);