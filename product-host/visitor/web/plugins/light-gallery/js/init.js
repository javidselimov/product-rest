$(document).ready(function () {
    $(".lightgallery").lightGallery({
        counter: false,
        thumbnail: true,
        mousewheel: true
    });

    $(".videogallery").lightGallery({
        selector: '.gallery-item, .video-card-popup',
        counter: false,
        thumbnail: false,
        mousewheel: true,
        zoom: false,
    });

    jQuery(".justified-gallery").justifiedGallery({
        rowHeight: 130,
        captions: true,
        margins: 10,
        waitThumbnailsLoad: true,
        randomize: false
    });

    jQuery(".pdf-view").lightGallery({
        selector: 'this',
    });

    /* Скрываем scrollbar в Popup окне */
    $('.pages-gallery, .lightgallery, .videogallery').on('onBeforeOpen.lg', function (event, prevIndex, index) {
        $('body').css('overflow', 'hidden')
    });
    $('.pages-gallery, .lightgallery, .videogallery').on('onBeforeClose.lg', function (event, prevIndex, index) {
        $('body').css('overflow', 'auto')
    });

    $('.gallery-item').hover(
        function () {
            $(this).find('.image img').css('opacity', '1')
        },
        function () {
            $(this).find('.image img').css('opacity', '0')
        }
    );

});