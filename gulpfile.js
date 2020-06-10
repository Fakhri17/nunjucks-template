/**
 * READ THE TUTORIAL HERE
 * - https://gulpjs.com/docs/en/getting-started/creating-tasks
 * - https://github.com/chidiwilliams/nunjucks-templating-starter/blob/master/gulpfile.js
 */
const del = require('del');
const gulp = require('gulp');
const nunjuckRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const sassRender = require('gulp-sass');
const minify = require('gulp-minify');
const npmDist = require('gulp-npm-dist');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();

const config = require('./config');

const compileAll = gulp.series(
  nunjuck,
  config.js.doCompress? jsMinify : js,
  sass,
  copyLibs,
  copyAssets,
);

/**
 * clean /dist directory
 * @param callback
 * @see https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md
 */
function cleanDist(callback) {
  del([
    'dist/*'
  ]);
  callback();
}

/**
 * minify javascript output
 */
function jsMinify() {
  return gulp
    .src(config.paths.assets_dir + '/js/**/*.js')
    .pipe(
      minify({
        ext: {
          src: '.js',
          min: '.js',
        },
        noSource: config.js.doKeepSource,
        exclude: [config.paths.libs_dir],
        ignoreFiles: ['.min.js'],
      })
    )
    .pipe(gulp.dest(config.paths.public_dir + '/assets/js'));
}

/**
 * javascript output
 */
function js() {
  return gulp
    .src(config.paths.assets_dir + '/js/**/*.js')
    .pipe(gulp.dest(config.paths.public_dir + '/assets/js'));
}

/**
 * compile scss to css
 */
function sass() {
  return gulp
    .src(config.paths.assets_dir + '/scss/**/*.scss')
    .pipe(
      sassRender({
        outputStyle: config.sass.outputStyle,
      })
    )
    .pipe(gulp.dest(config.paths.public_dir + '/assets/css'));
}

/**
 * copy all production files (usually inside node_modules/libName/dist directory) libs
 * from /node_modules to /dist/libs
 * @returns {*}
 */
function copyLibs() {
  return gulp
    .src(npmDist(), {
      base: config.paths.node_modules_dir
    })
    .pipe(rename(function(path) {
      // replace /dist output. sample :
      // libs/libName/dist/css >> /libs/libName/css
      // libs/libName/dist/js >> /libs/libName/js
      path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '');
    }))
    .pipe(gulp.dest(config.paths.public_dir + '/libs'));
}

/**
 * copy all assets images
 */
function copyAssets() {
  return gulp
    .src([
      config.paths.assets_dir + '/**/*',
      '!' + config.paths.assets_dir + '/js/**/*',
      '!' + config.paths.assets_dir + '/scss/**/*',
    ])
    .pipe(gulp.dest(config.paths.public_dir + '/assets'));
}

/**
 * initialize browser sync
 */
function browsersyncInit(callback) {
  browserSync.init({
    server: {
      baseDir: [config.paths.public_dir]
    },
  });
  callback();
}

/**
 * reload browser on file changes
 */
function browsersyncReload(callback) {
  browserSync.reload();
  callback();
}

/**
 * series of watch changes command
 */
function watchChanges() {
  return gulp.watch (
    [config.paths.src_dir + '/**/*.+(html|njk|js|css|scss)'],
    gulp.series(
      compileAll,
      browsersyncReload
    ),
  );
}

/**
 * compile nunjuck to html
 */
function nunjuck() {
  return gulp
    .src([
      config.paths.src_dir + '/**/*.+(html|njk)',
      '!' + config.paths.src_dir + '/_layouts/**/*.+(html|njk)',
      '!' + config.paths.src_dir + '/_partials/**/*.+(html|njk)',
    ])
    .pipe(data(function(){
      return require('./src/data.json')
    }))
    .pipe(
      nunjuckRender({
        path: [config.paths.src_dir]
      })
    )
    .pipe(gulp.dest(config.paths.public_dir));
}

exports.watch = gulp.series(cleanDist, compileAll, browsersyncInit, watchChanges);
exports.default = gulp.series(cleanDist, compileAll);