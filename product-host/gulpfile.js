const gulp = require('gulp');
const HubRegistry = require('gulp-hub');

var hub = new HubRegistry(['tasks/*.js']);
gulp.registry(hub);

gulp.task('production', gulp.series('combineCss', 'combineJs'));