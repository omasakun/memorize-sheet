const gulp = require('gulp');
const watch = require('gulp-watch');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rollup = require('rollup-stream');
const fs = require('fs');
const sourcemaps = require('gulp-sourcemaps');
const runSequence = require('run-sequence');

// Setting : Paths
const paths = {
  'src_pug': './src/pug/',
  'src_sass': './src/sass/',
  'pug_config_package': "./package.json",
  'pug_config_user': "./src/pug/config.json",
  'out_html': './docs/',
  'out_css': './docs/css/',
  'src_js': './docs/js/',
  'src_js_entry': "./docs/js/index.js",
  'out_js_bundle': "./docs/js/",
  'out_js_bundle_name': "bundle",
  'src_thirdparty': './thirdparty/',
  'out_thirdparty': "./docs/thirdparty/"
}

// Setting : Pug Options
const pugLocals = {
  package: {},
  user: {}
}

const pugOptions = {
  locals: pugLocals
}

// Setting : Sass Options
const sassOptions = {
  outputStyle: 'expanded'
}

const rollupOptions = {
  input: paths.src_js_entry,
  format: 'es',
  cache: cache,
  sourcemap: true
}

// [src_pug]/*.pug -> [out_html]/*.html
gulp.task('pug', () => {
  pugLocals.package = JSON.parse(fs.readFileSync(paths.pug_config_package).toString());
  pugLocals.user = JSON.parse(fs.readFileSync(paths.pug_config_user).toString());
  return gulp.src([paths.src_pug + '**/*.pug', '!' + paths.src_pug + '**/_*.pug'])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(pug(pugOptions))
    .pipe(gulp.dest(paths.out_html));
});

// [src_sass]/*.sass -> [out_css]/*.css
gulp.task('sass', () => {
  return gulp.src(paths.src_sass + '**/*.sass')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.out_css));
});

// JS bundle
var cache;
gulp.task('jsbundle', () => {
  return rollup(rollupOptions)
    .on('bundle', (bundle) => {
      cache = bundle;
    })
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(source(paths.out_js_bundle_name + ".js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.out_js_bundle));
});

gulp.task('copy-thirdparty', () => {
  return gulp.src(
      [paths.src_thirdparty + '**/*.*'], {
        base: paths.src_thirdparty
      }
    )
    .pipe(gulp.dest(paths.out_thirdparty));
});

// Browser Sync
gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: paths.out_html
    }
  });
});

gulp.task('reload', () => {
  if (browserSync.active) {
    browserSync.reload();
  }
});

gulp.task('build-sass', callback => {
  runSequence("sass", "reload", callback)
});
gulp.task('build-pug', callback => {
  runSequence("pug", "reload", callback)
});
gulp.task('build-js', callback => {
  runSequence("jsbundle", "reload", callback)
});
gulp.task('build-3rd', callback => {
  runSequence("copy-thirdparty", "reload", callback)
});

gulp.task('build', ["build-sass", "build-pug", "build-js", "build-3rd"]);

gulp.task('watch', () => {
  watch([paths.src_pug + '**/*.*', paths.pug_config_user, paths.pug_config_package],
    () => gulp.start("build-pug"))

  watch(paths.src_sass + '**/*.sass',
    () => gulp.start("build-sass"))

  watch([paths.src_js + '**/*.js', '!' + paths.src_js + '**/*.min.js'],
    () => gulp.start("build-js"))

  watch([paths.src_thirdparty + '**/*.*'],
    () => gulp.start("build-3rd"))
});

gulp.task('default', (callback) => {
  runSequence('browser-sync', 'build', 'watch', callback);
});