const gulp = require('gulp'),
    del = require('del'),
    uglifyJs = require('gulp-uglify'),
    concat = require('gulp-concat');

const projectRoot = 'visitor/web/';

const path = {
    build: {
        js: projectRoot + 'dist'
    },
    src: {
        js: [
            projectRoot + 'js/jquery.min.js',
            projectRoot + 'plugins/jquery-mousewheel/jquery.mousewheel.min.js',
            projectRoot + 'plugins/light-gallery/js/lightgallery.min.js',
            projectRoot + 'plugins/light-gallery/modules/lg-fullscreen.min.js',
            projectRoot + 'plugins/light-gallery/modules/lg-thumbnail.min.js',
            projectRoot + 'plugins/light-gallery/modules/lg-zoom.min.js',
            projectRoot + 'plugins/light-gallery/modules/lg-video.min.js',
            projectRoot + 'plugins/light-gallery/js/init.js',
            projectRoot + 'plugins/light-gallery/js/jquery.justifiedGallery.min.js',
            projectRoot + 'plugins/jquery-formstyler/form-styler.min.js',
            projectRoot + 'plugins/jquery-navgoco/jquery-navgoco.min.js',
            projectRoot + 'plugins/swiper/swiper.min.js',
            projectRoot + 'plugins/jquery-menu/jquery-menu.min.js',
            projectRoot + 'plugins/pickmeup/pickmeup.min.js',
            projectRoot + 'plugins/jquery-list/jquery-list.js',
            projectRoot + 'plugins/jquery-accordion/jquery-accordion.js',
            projectRoot + 'plugins/jquery-pagination/jquery-pagination.min.js',
            projectRoot + 'plugins/chart-js/moment.min.js',
            projectRoot + 'plugins/chart-js/chart.min.js',
            projectRoot + 'plugins/chart-js/init.js',
            projectRoot + 'plugins/chart-js/money-market-new.js',
            projectRoot + 'plugins/chart-js/money-market.js',
            projectRoot + 'plugins/jquery-highlight/jquery.highlight.js',
            projectRoot + 'plugins/read-more/read-more.min.js',
            projectRoot + 'plugins/tail-select/tail-select.min.js',
            projectRoot + 'plugins/tail-select/init.js',
            projectRoot + 'plugins/printJS/printJS.min.js',
            projectRoot + 'plugins/plugins.js',
            projectRoot + 'js/custom.js',
            projectRoot + 'js/metrika.js'
        ]
    }
};

function clean() {
    return del([projectRoot + 'dist/core.min.js']);
}

function js() {
    return gulp.src(path.src.js)
        .pipe(concat('core.min.js'))
        .pipe(uglifyJs())
        .pipe(gulp.dest(path.build.js))
}


gulp.task('combineJs', gulp.series(clean, js));
