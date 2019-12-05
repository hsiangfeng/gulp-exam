const gulp = require('gulp');
const $ = require('gulp-load-plugins')({ lazy: false });
const autoprefixer = require('autoprefixer');
const minimist = require('minimist');
const log = require('fancy-log');

const envOptions = {
  string: 'env',
  default: {
    env: 'dev',
  },
},

const devStatus = minimist(process.argv.slice(2), envOptions);

// develop status
// eslint-disable-next-line no-console
console.log(devStatus);

/**
 * ejs Block
 */
function ejs() {
  return gulp.src([
    './src/templates/**.ejs',
    '!./src/templates/**/_*.ejs',
    ])
    .pipe($.ejs({
      title: 'Gulp 環境測驗',
    }).on('error', log))
    .pipe($.rename({ extname: '.html' }))
    .pipe($.if(envOptions.env === 'prod', $.htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest('./public'));
}

/**
 * Sass block
 */
function sass() {
  const plugins = [
    autoprefixer(),
  ];
  return gulp.src(['./src/stylesheets/**/*.scss'])
    .pipe($.sourcemaps.init())
    .pipe(
      $.sass().on('error', $.sass.logError),
    )
    .pipe($.postcss(plugins))
    .pipe($.if(envOptions.env === 'prod', $.cssnano()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/stylesheets'));
}

/**
 * JavaScript block
 */
function babel() {
  return gulp.src(['./src/javascript/**/*.js'])
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['@babel/env'],
    }))
    .pipe($.concat('all.js'))
    .pipe($.if(envOptions.env === 'prod', $.uglify()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/javascript'));
}

function vendorsJs() {
  return gulp.src()
    .pipe($.concat('vendors.js'))
    .pipe(gulp.dest('./public/javascript'));
}

/**
 * Images block
 */
function images() {
  return gulp.src(['./src/images/**/*'])
    .pipe($.if(envOptions.env === 'prod', $.image()))
    .pipe(gulp.dest('./public/images'));
}

/**
 * clean file
 */
function clean() {
  return gulp.src('./public', { read: false, allowEmpty: true })
    .pipe($.clean());
}

/**
 * watch file
 */
function watch() {
  gulp.watch('./src/templates/**.ejs', ejs);
  gulp.watch('./src/stylesheets/**/*.scss', sass);
  gulp.watch('./src/javascript/**/*.js', babel);
}

exports.build = gulp.series(clean, ejs, sass, babel, vendorsJs, images);

exports.default = gulp.series(
  clean,
  ejs,
  sass,
  babel,
  vendorsJs,
  images,
  gulp.parallel(watch),
);
