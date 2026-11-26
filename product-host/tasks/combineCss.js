const gulp = require('gulp'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCss = require('gulp-clean-css'),
    concat = require('gulp-concat');

const projectRoot = 'visitor/web/';

const path = {
    build: {
        css: projectRoot + 'dist'
    },
    src: {
        css: [
            projectRoot + 'css/fonts.css',
            projectRoot + 'plugins/light-gallery/css/lightgallery.css',
            projectRoot + 'plugins/light-gallery/css/justifiedGallery.min.css',
            projectRoot + 'plugins/jquery-formstyler/form-styler.css',
            projectRoot + 'plugins/jquery-navgoco/jquery-navgoco.css',
            projectRoot + 'plugins/swiper/swiper.css',
            projectRoot + 'plugins/jquery-menu/jquery-menu.min.css',
            projectRoot + 'plugins/pickmeup/pickmeup.css',
            projectRoot + 'plugins/jquery-list/jquery-list.css',
            projectRoot + 'plugins/jquery-accordion/jquery-accordion.css',
            projectRoot + 'plugins/jquery-tooltip/jquery-tooltip.css',
            projectRoot + 'plugins/jquery-pagination/jquery-pagination.css',
            projectRoot + 'plugins/tail-select/tail-select.css',
            projectRoot + 'css/core.css',
            projectRoot + 'css/custom.css',
            projectRoot + 'css/media.css',
        ]
    }
};

function clean() {
    return del([projectRoot + 'dist/core.min.css']);
}

function css() {
    return gulp.src(path.src.css)
        .pipe(concat('core.min.css'))
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(cleanCss({rebase: false, level: {2: {specialComments: 0}}}))
        .pipe(gulp.dest(path.build.css))
}


gulp.task('combineCss', gulp.series(clean, css));
