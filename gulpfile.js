import gulp from 'gulp'
// SERVER
import browserSync from 'browser-sync'
// HTML
import htmlmin from 'gulp-htmlmin'
// CSS
import gulpLess from 'gulp-less'
import sourcemaps from 'gulp-sourcemaps'
import postcss from 'gulp-postcss'
import csso from 'postcss-csso'
import autoprefixer from 'autoprefixer'
// JS 
import terser from 'gulp-terser'
// IMAGE
import imagemin, { mozjpeg, optipng } from 'gulp-imagemin'
import webp from 'gulp-webp'
// CUSTOM
import { deleteAsync } from 'del'
import plumber from 'gulp-plumber'

const browserSyncCreate = browserSync.create()

// HTML
export const html = () => {
	return gulp.src('source/*.html')
		.pipe(plumber())
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('build'))
		.pipe(browserSyncCreate.stream({ match: '**/*.html' }))
}
// STYLE
export const less = () => {
	return gulp.src('source/less/style.less')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(gulpLess())
		.pipe(postcss([
			autoprefixer(),
			csso()
		]))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest('build/css'))
		.pipe(browserSyncCreate.stream())
}
// IMAGE
export const images = () => {
	return gulp.src(['source/img/**/*.{jpg,png}', '!source/img/favicon/**'], { encoding: false })
		.pipe(imagemin([
			mozjpeg({ quality: 80, progressive: true }),
			optipng({ optimizationLevel: 5 }),
		]))
		.pipe(gulp.dest('build/img'))
		.pipe(webp({ quality: 80 }))
		.pipe(gulp.dest('build/img'))
		.pipe(browserSyncCreate.stream())

}
export const svg = () => {
	return gulp.src(['source/img/**/*.svg', '!source/img/favicon/**'], { encoding: false })
		.pipe(gulp.dest('build/img/'))
}
export const favicon = () => {
	return gulp.src('source/img/favicon/**.{png,svg,ico}')
		.pipe(gulp.dest('build/img/favicon/'))
}
export const manifest = () => {
	return gulp.src('source/manifest.webmanifest')
		.pipe(gulp.dest('build/'))
}
// JS
export const js = () => {
	return gulp.src('source/js/**/*.js')
		.pipe(plumber())
		.pipe(terser())
		.pipe(gulp.dest('build/js'))
		.pipe(browserSyncCreate.stream())
}
// FONT 
export const fonts = () => {
	return gulp.src('source/fonts/**/*.{woff,woff2}', { encoding: false })
		.pipe(gulp.dest('build/fonts'))
}
// CLEAN
export const clean = () => {
	return deleteAsync('build/**/*', { force: true });
}
// SERVER
export const server = () => {
	browserSyncCreate.init({
		server: {
			baseDir: "build"
		},
		open: true,
		notify: false,
		ui: false,
	});
}
export const reload = (done) => {
	browserSyncCreate.reload();
	done();
}
// WATCH
export const watch = () => {
	gulp.watch("source/less/**/*.less", less)
	gulp.watch("source/*.html", html)
	gulp.watch("source/img/**", images)
}
// 
export const prod = gulp.series(
	clean,
	gulp.parallel(
		html,
		less,
		fonts,
		js,
		manifest
	),
	images,
	svg,
	favicon
)
export default gulp.series(
	prod,
	gulp.parallel(
		server,
		watch
	)
)
