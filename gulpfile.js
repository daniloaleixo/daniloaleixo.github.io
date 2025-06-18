import gulp from 'gulp';
import plumber from 'gulp-plumber';
import uglify from 'gulp-uglify';
import sass from 'gulp-sass';
import * as dartSass from 'sass';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';

const sassCompiler = sass(dartSass);

// Scripts task
function scripts() {
    return gulp.src('public/js/scripts.js')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('public/js'));
}

// Styles task
function styles() {
    return gulp.src('scss/styles.scss')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(sassCompiler({outputStyle: 'compressed'}))
        .pipe(autoprefixer())
        .pipe(gulp.dest('public/css'));
}

// Watch task
function watch() {
    gulp.watch('public/js/*.js', scripts);
    gulp.watch('scss/*.scss', styles);
}

// Build task
const build = gulp.parallel(scripts, styles);

// Export tasks
export { scripts, styles, watch, build };
export default build;
