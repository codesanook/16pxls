const gulp = require('gulp');
const del = require('del');
const sketchClean = require('gulp-clean-sketch');
const svgmin = require('gulp-svgmin');
const raster = require('gulp-raster');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const svgCss = require('gulp-svg-css');
const fileList = require('gulp-filelist');
const headerComment = require('gulp-header-comment');

// Clean & Minimise SVG
gulp.task('cleanSVG', function(cb){
  return gulp.src('dist/svg/*.svg')
    .pipe(sketchClean())
    .pipe(svgmin({js2svg : {pretty : true}}))
    .pipe(gulp.dest('dist/svg'))
    cb(err);
});

// Create PNG
gulp.task('createPNG', ['cleanSVG'], function(cb) {
  return gulp.src('dist/svg/*.svg')
    .pipe(raster())
    .pipe(rename({extname : '.png'}))
    .pipe(gulp.dest('dist/png/@1x'))
    cb(err);
});

// Create PNG Scaled for Retina
gulp.task('createRetinaPNG', ['createPNG'], function(cb){
  return gulp.src('dist/svg/*.svg')
    .pipe(raster({scale : 2}))
    .pipe(rename({extname : '.png', suffix : '@2x'}))
    .pipe(gulp.dest('dist/png/@2x'))
    cb(err);
});

// Create JPG
gulp.task('createJPG', ['createRetinaPNG'], function(cb){
  return gulp.src('dist/svg/*.svg')
    .pipe(raster())
    .pipe(rename({extname : '.jpg'}))
    .pipe(gulp.dest('dist/jpg/@1x'))
    cb(err);
});

// Create JPG Scaled for Retina
gulp.task('createRetinaJPG', ['createJPG'], function(cb){
  return gulp.src('dist/svg/*.svg')
    .pipe(raster({scale : 2}))
    .pipe(rename({extname : '.jpg', suffix : '@2x'}))
    .pipe(gulp.dest('dist/jpg/@2x'))
    cb(err);
});

// Optimise PNGs Images
gulp.task('optimisePNG', ['createRetinaPNG'], function(){
  return gulp.src('dist/png/**/*.png')
    .pipe(imagemin([imagemin.optipng({optimizationLevel: 5})]))
    .pipe(gulp.dest('dist/png'))
});

// Optimise JPG Images
gulp.task('optimiseJPG', ['createRetinaJPG'], function(){
  return gulp.src('dist/jpg/**/*.jpg')
    .pipe(imagemin([imagemin.jpegtran({progressive: true})]))
    .pipe(gulp.dest('dist/jpg'))
});

// Generate Css
gulp.task('genCss', ['cleanSVG'], function(){
  return gulp.src('dist/svg/*.svg')
    .pipe(svgCss({
      fileName : '16pxls'
    }))
    .pipe(gulp.dest('dist/css'))
});

// Create .JSON List of Icons
gulp.task('iconList', function(){
  gulp.src('dist/svg/*.svg')
  .pipe(fileList('iconList.json', {
    flatten : true,
    removeExtensions: true
  }))
  .pipe(gulp.dest('dist/docs/assets/json'))
});

gulp.task('licenceComment', function(){
  gulp.src('dist/Align-Bottom.svg')
    .pipe(headerComment(`
    Copywrite <%= moment().format('YYYY') %> <%= _.capitalize(pkg.author) %>

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    `))
    .pipe(gulp.dest('dist/'))
});

// Remove .DS_Store
gulp.task('clean', function(){
  return del(['**/.DS_Store']);
});

// Clear Icons from Dist
gulp.task('cleanIcons', function(){
  return del(['dist/png/**/*.png', 'dist/css/*.css', 'dist/jpg/**/*.jpg'])
});

// Process Icons Task
gulp.task('processIcons', ['cleanSVG', 'createPNG', 'createRetinaPNG', 'createJPG', 'createRetinaJPG', 'optimisePNG', 'optimiseJPG' , 'genCss']);
