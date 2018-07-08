var gulp = require('gulp');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
var tingpng = require('gulp-tinypng');
var uglify = require('gulp-uglify');
var notify = require( 'gulp-notify' );
var useref = require('gulp-useref');
var sourcemaps = require('gulp-sourcemaps');
var watch = require('gulp-watch');
// var concat = require('gulp-concat'); // Объединение файлов

var reload = browserSync.reload;
var keytiny = 'U4JJZIgEqa0sa0m400fJjAP9HSGD1MIq'

/* Отслеживаем */

gulp.task('serve', ['less'], function () {  
    browserSync.init({
        server: './',
        port: 8080
    });

    gulp.watch('assets/less/*.less', ['less']).on('change', browserSync.reload);
    gulp.watch('./*.html').on('change', browserSync.reload);

    gulp.src('assets/less/*.less')
    .pipe( less().on( 'error', notify.onError(
      {
        message: "<%= error.message %>",
        title  : "LESS Error!"
      } ) )
    )
    .pipe(gulp.dest('assets/css'))
    .pipe(browserSync.stream())
    .pipe( notify( 'Все отлично!' ) );
});

/* Отслеживаем END */

gulp.task('less', () =>  
    gulp.src('assets/less/*.less')
    .pipe( less().on( 'error', notify.onError(
      {
        message: "<%= error.message %>",
        title  : "LESS Error!"
      } ) )
    )
    .pipe(gulp.dest('assets/css'))
    .pipe(browserSync.stream())
    .pipe( notify( 'LESS Скомпилирован!' ) )
);

gulp.task('autoprefixer', () =>
    gulp.src('assets/css/*.css')
    .pipe(autoprefixer({
        browsers: ['last 16 versions'],
        cascade: false
    }))
    .pipe(gulp.dest('assets/css/'))
);

gulp.task('cleanCSS', () =>  
    gulp.src('assets/css/*.css')
    .pipe(cleanCSS().on( 'error', notify.onError(
      {
        message: "<%= error.message %>",
        title  : "cleanCSS Error!"
      } ) )
    )
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('assets/css/'))
    .pipe(notify( 'CSS Сжат!' ) )
);

gulp.task('tinypng', () => 
    gulp.src(['assets/img/**/*.png','assets/img/**/*.jpg','assets/img/**/*.jpeg'])
        // .pipe(tingpng(keytiny))
        .pipe(tingpng(keytiny).on( 'error', notify.onError(
          {
            message: "<%= error.message %>",
            title  : "tinypng Error!"
          } ) )
        )
        .pipe(gulp.dest('build/img/'))
        .pipe(notify( 'Изображение сжато!' ) )
);

gulp.task('uglify', () =>  
    gulp.src(['assets/js/*.js', '!assets/js/*.min.js'])
    .pipe(uglify().on( 'error', notify.onError(
      {
        message: "<%= error.message %>",
        title  : "uglify Error!"
      } ) )
    )
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('build/assets/js/'))
    .pipe(notify( 'JS сжат!' ) )
);

/* Пути */

var path = {
    build: { // Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        css: 'build/assets/css/',
        js: 'build/assets/js/',
        img: 'build/assets/img/',
        lib: 'build/assets/lib/',
        cssnone: 'build/assets/css/'
    },
    src: { // Пути откуда брать исходники
        html: './*.html',
        style: 'assets/less/*.less',
        js: ['assets/js/*.js', '!assets/js/*.min.js'],
        img: ['assets/img/**/*.png','assets/img/**/*.jpg','assets/img/**/*.jpeg'],
        lib: 'assets/lib/**/*.*',
        cssnone: 'assets/css/*.css'
    }
};

/* Пути END */

/* Сброка проекта */

gulp.task('html:build', () => 
    gulp.src(path.src.html) // Выберем файлы по нужному пути
        .pipe(useref()) // Добавляем пути сжатых файлов
        .pipe(gulp.dest(path.build.html)) // Выплюнем их в папку build
        .pipe(reload({stream: true})) // И перезагрузим наш сервер для обновлений
);

gulp.task('lib:build', () => 
    gulp.src(path.src.lib) // Выберем файлы по нужному пути
        .pipe(gulp.dest(path.build.lib)) // Выплюнем их в папку build
);

gulp.task('jsnone:build', () => 
    gulp.src(path.src.js) // Выберем наши js
        .pipe(gulp.dest(path.build.js)) // И в build
);

gulp.task('cssnone:build', () => 
    gulp.src(path.src.cssnone) // Выберем наши css
        .pipe(gulp.dest(path.build.cssnone)) // И в build
);

gulp.task('imagenone:build', () => 
    gulp.src(path.src.img) // Выберем наши картинки
    .pipe(gulp.dest(path.build.img)) // И бросим в build
);

gulp.task('style:build', () => 
    gulp.src(path.src.style) // Выберем наш less
        .pipe(less()) // Скомпилируем
        .pipe(autoprefixer({
            browsers: ['last 16 versions'],
            cascade: false
        })) // Добавим вендорные префиксы
        .pipe(cleanCSS()) // Сожмем
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(path.build.css)) // И в build
);

gulp.task('js:build', () => 
    gulp.src(path.src.js) // Выберем наши js
        .pipe(sourcemaps.init())
            .pipe(uglify())
                .pipe(rename({
                    suffix: '.min'
                })) 
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js)) // И в build
);

gulp.task('image:build', () => 
    gulp.src(path.src.img) // Выберем наши картинки
        .pipe(tingpng(keytiny))
        .pipe(gulp.dest(path.build.img)) // И бросим в build
);

gulp.task('build', [
    'html:build',
    'lib:build',
    'jsnone:build',
    'cssnone:build',
    'style:build',
    'js:build',
    'image:build'
]);

/* Бес сжатия изображений */

gulp.task('noimg:build', [
    'html:build',
    'lib:build',
    'jsnone:build',
    'cssnone:build',
    'style:build',
    'js:build',
    'imagenone:build'
]);

/* Сброка проекта END */

gulp.task('default', ['serve']);