var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    compass = require('gulp-compass'),
    minifyCSS = require('gulp-minify-css'),
    sync = require('gulp-sync-files'),
    mainBowerFiles = require('main-bower-files'),
    mainBowerScripts = mainBowerFiles({dependencies: null, filter: function (filename) {
      return filename.match('.js$');
    }}),
    htmlmin = require('gulp-htmlmin'),
    ngTemplates = require('gulp-ng-templates'),
    fs = require('fs'),
    git = require('git-rev');

var RELEASE_INFO_PATH = __dirname + '/dist/release-info.json';

function getReleaseInfo () {
    try {
        // the file may not exist or may be malformed -- handle any case
        return require(RELEASE_INFO_PATH);
    } catch (e) {
        return {};
    }
}


gulp.task('compass', function() {
  gulp.src('app/styles/*.sass')
    .pipe(compass({
      config_file: './config.rb',
      css: 'app/styles',
      sass: 'app/styles'
    }))
    .pipe(gulp.dest('app/assets/temp'));
});

gulp.task('production:styles', function() {

  gulp.src('app/styles/*.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist/styles'));

});

gulp.task('production:scripts', function () {

  gulp.src(mainBowerScripts)
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'));

  gulp.src(['app/scripts/_modules/**/*.js', 'app/scripts/**/*.js']) // enforce modules being first
    .pipe(concat('scripts.js'))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('dist/scripts'));

  gulp.src('app/js/index.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));

});


gulp.task('production:files', function () {
    
  gulp.src('app/images/**/*')
    .pipe(gulp.dest('dist/images'));

  gulp.src('app/config/**/*')
    .pipe(gulp.dest('dist/config'));

});

gulp.task('production:tag', function () {

    var releaseInfo = getReleaseInfo();

    git.tag(function (tag) {
        // update the tag
        if(releaseInfo.tag !== tag) {
            releaseInfo.tag = tag;
            fs.writeFile(RELEASE_INFO_PATH, JSON.stringify(releaseInfo));
        }
    });

});

gulp.task('production:release', function () {

    var releaseInfo = getReleaseInfo();

    // increment the build number
    releaseInfo.build = 'build' in releaseInfo ? releaseInfo.build + 1 : 0;

    // any other build information
    // save the file
    fs.writeFile(RELEASE_INFO_PATH, JSON.stringify(releaseInfo));

});

gulp.task('templates', function () {
    gulp.src('app/views/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(ngTemplates({
            filename: '_partials.js',
            module: 'fixedApp:partials',
            path: function (path, base) {
                // just the filename
                return path.substr(base.length).slice(0, -'.html'.length);
            }
        }))
        .pipe(gulp.dest('app/scripts'));
});

// watch files for changes
gulp.task('watch', function() {
    // should configure gulp newer for these tasks
    gulp.watch('app/styles/*.sass', ['compass']);
    gulp.watch('app/views/*.html', ['templates']);
});

// Development Tasks
gulp.task('dev', ['compass', 'templates']);

// Local tasks
gulp.task('default', ['compass', 'templates', 'watch']);

// Production Tasks
gulp.task('build', ['production:styles', 'production:scripts', 'production:files', 'production:tag', 'production:release']);