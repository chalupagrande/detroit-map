const gulp = require('gulp'),
      browserSync = require('browser-sync'),
      sass = require('gulp-sass'),
      babel = require('gulp-babel'),
      concat = require('gulp-concat'),
      sourcemaps = require('gulp-sourcemaps'),
      plumber = require('gulp-plumber');

gulp.task('serve', ['compile-js','compile-sass'], ()=>{
  browserSync.init({
    server: {
      baseDir:'./'
    }
  })
})

gulp.task('compile-js', ()=>{
  return gulp.src('src/scripts/**/*.js')
             .pipe(plumber({
               errorHandler(error){
                 console.log(error.message)
                 this.emit('end')
               }
             }))
             .pipe(sourcemaps.init())
             .pipe(babel({
               presets:['es2015']
             }))
             .pipe(concat('app.js'))
             .pipe(sourcemaps.write('.'))
             .pipe(gulp.dest('client/scripts'))
})

gulp.task('compile-sass', ()=>{
  return gulp.src('src/styles/**/*.scss')
             .pipe(plumber({
               errorHandler(error){
                 console.log(error.message)
                 this.emit('end')
               }
             }))
             .pipe(sourcemaps.init())
             .pipe(sass())
             .pipe(concat('styles.css'))
             .pipe(sourcemaps.write('.'))
             .pipe(gulp.dest('client/styles'))
})
gulp.task('default', ["serve"], ()=>{
  gulp.watch(['src/scripts/**/*.js'],['compile-js'])
  gulp.watch(['src/styles/**/*.scss'],['compile-sass'])
  gulp.watch(['src/styles/**/*.scss', 'src/scripts/**/*.js', 'client/*.html']).on('change', browserSync.reload)
  console.log('running gulp task!')
})