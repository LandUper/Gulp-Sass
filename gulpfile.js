var gulp           = require("gulp");
var sass 					 = require("gulp-sass");
var plumber 			 = require("gulp-plumber");
var postcss				 = require("gulp-postcss");
var autoprefixer	 = require("autoprefixer");
var server	       = require("browser-sync");
var mqpacker	     = require("css-mqpacker");
var minify	       = require("gulp-csso");
var rename	       = require("gulp-rename");
var imagemin	     = require("gulp-imagemin");
var svgstore	     = require("gulp-svgstore");
var svgmin	       = require("gulp-svgmin");
var del	           = require("del");
var concat	       = require("gulp-concat");
var uglify	       = require("gulp-uglifyjs");
var ftp            = require("vinyl-ftp");
var run            = require("run-sequence");

gulp.task('browser-sync', function() {
	server({
		server: {
			baseDir: 'src'
		},
		notify: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

gulp.task("style", function() {
	gulp.src("src/sass/style.sass")
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss([
			autoprefixer({browsers: [
				"last 15 versions"
			]}),
			mqpacker({
				sort: true
			})			
		]))
		.pipe(gulp.dest("src/css"))
		.pipe(minify())
		.pipe(rename("style.min.css"))
		.pipe(gulp.dest("src/css"))
		.pipe(server.reload({stream: true}));
});

gulp.task('scripts', function() {
	return gulp.src([
			'src/libs/jquery/dist/jquery.min.js',
			'src/js/common.js'
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('src/js'))
});

gulp.task('watch', ['style', 'scripts', 'browser-sync'], function() {
	gulp.watch('src/sass/**/*.sass', ['style']);
	gulp.watch('src/js/scripts.min.js' , ['scripts'], server.reload);
	gulp.watch('src/*.html', server.reload);
});

gulp.task("images", function() {
	return gulp.src("src/img/**/*.{png,jpg,gif,ico}")
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true})
		]))
		.pipe(gulp.dest("build/img"));
});

// gulp.task("symbols", function() {
// 	return gulp.src("src/img/icons/*.svg")
// 		.pipe(svgmin())
// 		.pipe(svgstore({
// 			inlineSvg: true
// 		}))
// 		.pipe(rename("symbols.svg"))
// 		.pipe(gulp.dest("src/img-min/icons"));
// });

gulp.task("clean", function() {
	return del("build");
});

gulp.task("copy", ['images'], function() {
	return gulp.src([
			"src/fonts/**/*",
			"src/*.html",
			"src/.htaccess",
			"src/css/style.min.css",
			"src/js/scripts.min.js",
		], {
			base: "src"
		})
	.pipe(gulp.dest("build"));
});

gulp.task("build", function(fn) {
	run(
		"clean",
		"copy",
		// "symbols", 
		fn
	);
});

gulp.task('deploy', function() {
	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'build/**',
	'build/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));
});

gulp.task('default', ['watch']);