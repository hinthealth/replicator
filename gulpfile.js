var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

var paths = {
	src: ['src/replicator.js'],
	dest: 'dist'
};

var config = {
	rename: { suffix: '.min' }
};

gulp.task('default', function() {

	return gulp.src(paths.src)
		.pipe(gulp.dest(paths.dest))
		.pipe(rename(config.rename))
		.pipe(sourcemaps.init())
			.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.dest));
});
