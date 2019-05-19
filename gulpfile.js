const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const terser = require('gulp-terser');
const eslint = require('gulp-eslint');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-clean-css');
const purge = require('gulp-css-purge');
const sourcemaps = require('gulp-sourcemaps');
const lineEndings = require('gulp-line-ending-corrector');
const browserSync = require('browser-sync').create();

sass.compiler = require('node-sass');
// you can use plumber or you can just use, for example, sass's on error handling

// compress images
gulp.task('imageMin', () => gulp
  .src('src/assets/images/*')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/assets/images')));

// js linter
gulp.task('eslint', () => gulp
  .src('src/js/*.js')
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

gulp.task('eslintFix', () => gulp
  .src('src/js/*.js')
  .pipe(
    eslint({
      fix: true,
    }),
  )
  .pipe(eslint.format())
  .pipe(gulp.dest('src/js/')));

// concatenate and minify js
gulp.task('scripts', () => gulp
  .src('src/js/*.js')
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(
    babel({
      presets: ['@babel/env'],
    }),
  )
  .pipe(concat('main.js'))
  .pipe(terser())
  .pipe(lineEndings())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream()));

// compile sass and rename to conventional styles.css
gulp.task('sass', () => gulp
  .src('src/styles/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(prefix('last 2 versions'))
  .pipe(cleanCSS())
  .pipe(lineEndings())
  .pipe(sourcemaps.write())
  .pipe(rename('styles.css'))
  .pipe(gulp.dest('dist/'))
  .pipe(browserSync.stream()));

gulp.task('tailwind', () => gulp
  .src('src/styles/main.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([tailwindcss('tailwind.js')]))
  .pipe(prefix('last 2 versions'))
  .pipe(rename('styles.css'))
  .pipe(cleanCSS())
  .pipe(gulp.dest('dist/'))
  .pipe(browserSync.stream()));

// browser-sync on changes
gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: './',
    },
  });
  // watch and compile
  gulp.watch('src/styles/**/*.scss', gulp.series('tailwind'));
  gulp.watch('src/js/*.js', gulp.series('scripts'));
  // watch and reload
  gulp.watch('*.html').on('change', browserSync.reload);
  gulp.watch('dist/*.js').on('change', browserSync.reload);
});

gulp.task('default', gulp.series('scripts', 'tailwind', 'serve'));
