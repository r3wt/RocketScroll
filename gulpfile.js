var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pump = require('pump');
var rename = require("gulp-rename");
var sass = require('gulp-sass');
 
gulp.task('default', function (cb) {
  pump([
        gulp.src('src/*.js'),
        uglify({ preserveComments: 'license', mangle: true }),
		rename(function (path) {
			path.basename += ".min";
			path.extname = ".js";
		}),
        gulp.dest('dist'),
		gulp.src('src/rocketscroll.scss'),
		sass({outputStyle: 'compressed'}),
		rename('rocketscroll.min.css'),
		gulp.dest('dist')
	],
	cb
  );
});