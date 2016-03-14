var jshint = require('gulp-jshint');
var gulp   = require('gulp');

gulp.task('lint', function() {
  return gulp.src(['./callout.js','./test/test.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
  	.pipe(jshint.reporter('fail'));
});

gulp.task('default', ['lint']);