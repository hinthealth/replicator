var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var paths = {
	vendor: ['node_modules/faker/minfaker.js',
			 'bower_components/jquery/dis/jquery.min.js',
			 'bower_components/lodash/dist/lodash.min.js'
			],
	src: 'src/replicator.js'
};

gulp.task('default', function() {
	var build_files = paths.vendor.concat(paths.src)
	return gulp.src(build_files)
		.pipe(concat('replicator.js'))
		.pipe(gulp.dest('./dist/'))
		.pipe(concat('replicator.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest("./dist/"));
});