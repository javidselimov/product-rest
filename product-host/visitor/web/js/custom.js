$(document).ready(function () {

    //Active функции для Left Menu
    function setNavigation() {
        var url = location.pathname + location.search;
        console.log(url);
        var a = $('ul.nav li > a[href$="' + url + '"]');
        if (a.length > 0) {
            a = a.parent();
            a.addClass('active');
            if (a.find('>ul').length) {
                a.addClass('open');
                a.find('>ul').show();
            }
            a = a.parent();
            while (!a.hasClass('nav')) {
                if (a.is('ul')) a.show();
                else a.addClass('open');
                a = a.parent();
            }
        }
    }

    setNavigation();

    //Для ЧПУ Search
    $('#searchForm').submit(function () {
        window.location = $(this).attr("action") + '/' + $('#type').val() + '/' + $('#query').val();
        return false;
    });

    //Подсветка текста для Pages
    var hash = location.hash.substr(1);
    console.log(hash);
    $('.type_text').highlight(decodeURIComponent(hash), {element: 'strong', className: 'highlight'});

    //TODO отрефакторить
    //Вставка ресурсов на любой участок страницы и последующее скрытие ресурса
    $('.type_text a[href^="#asset-"]').each(function (index) {
        var assetID = $(this).attr("href");
        var assetNewDiv = $(this).parent();
        var assetMainDiv = $('.download_block ' + assetID);
        var assetFileName = assetMainDiv.attr('href');
        if (assetFileName) {
            if (assetFileName.indexOf('png') >= 0 || assetFileName.indexOf('jpg') >= 0) {
                $('<a class="page-gallery-item" data-src="' + assetFileName + '"><img width="200" src="' + assetFileName + '"></a>').appendTo(assetNewDiv);
            } else {
                assetMainDiv.clone().appendTo(assetNewDiv);
            }
        }
        assetMainDiv.remove();
        $('.type_text > p a').css('opacity', '1');
        $(this).remove();
    });

    //Трансформация ресурсов-изображений в фотографии с галереей
    $('.download_block a[id^="asset-"]').each(function (index) {
        var assetFileName = $(this).attr('href');
        if (assetFileName.indexOf('png') >= 0 || assetFileName.indexOf('jpg') >= 0) {
            var item = $('<a class="page-gallery-item" data-src="' + assetFileName + '"><img width="200" src="' + assetFileName + '"></a>');
            $(this).replaceWith(item);
        }
    });

    //Инициализация LightGallery на страницах
    if ($('.pages-gallery').length) {
        //Инициализация LightGallery на страницах
        $('.pages-gallery').lightGallery({
            selector: '.page-gallery-item',
            counter: false,
            thumbnail: true,
            mousewheel: true,
            hideBarsDelay: 1000
        });
    }

    //Задаем стиль для asset блоков в jquery-list
    $('dd:has(a.download_item)').addClass('assets');

    //Ссылки галареи
    $('.gallery-item').click(function () {
        $(location).attr('href', $(this).attr("data-href"))
    });

    //A+ A- for pages
    $('#controls a').click(function () {
        var t = $('.type_text'),
            h = t.find('h1'),
            i = t.find('p, div, ul, ol, li'),
            hs = parseInt(h.css('font-size')),
            is = parseInt(i.css('font-size'));

        if ($(this).hasClass('minus')) {
            hs > 20 && h.css('font-size', (hs - 2) + 'px');
            is > 14 && i.css('font-size', (is - 2) + 'px');
        } else {
            hs < 28 && h.css('font-size', (hs + 2) + 'px');
            is < 28 && i.css('font-size', (is + 2) + 'px');
        }
    });

    //Scroll to content on mobile
    if ($(document).width() < 750) {
        $('#leftMenu li.active > a, #pagesMenu li.active').click(function (e) {
            e.preventDefault();
            $('html,body').animate({
                scrollTop: $('.content_content').offset().top
            }, 'slow');
        });
        if ($('#leftMenu li.active, #pagesMenu li.active').length > 0) {
            $('html,body').animate({
                scrollTop: $('.content_content').offset().top
            }, 'slow');
        }
    }

    //Scroll to top
    $(window).scroll(function () {
        if ($(this).scrollTop() >= 50) {
            $('#return-to-top').fadeIn(200);
        } else {
            $('#return-to-top').fadeOut(200);
        }
    });
    $('#return-to-top').click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 500);
    });

    //Language switcher edit for IOS
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
        console.log('ios detected');
        $(document).bind('click', '.lang .jq-selectbox', function () {
            if ($('.lang .jq-selectbox').hasClass('opened')) $('.lang .jq-selectbox').removeClass('dropdown opened');
            else $('.lang .jq-selectbox').addClass('dropdown opened');
        });
    }

    $(".lang .auto-redirect").hide();

    //Readmore Button for 100Years
    $('.content100Years').readmore({
        speed: 40,
        collapsedHeight: 2700,
        moreLink: '<a href="#" class="read_more">' + $('.content100Years').attr("data-moreButton") + '</a>',
        lessLink: false,
        afterToggle: function () {
            $('.content100Years').addClass("auto-height");
        }
    });

    //Fadein animation for Pjax content reloading
    $(document).on('pjax:end', function () {
        $('.pjax-content').fadeOut('fast');
        $('.pjax-content').fadeIn('slow');
    });

    //Add tooltip with title
    $('a[title]').each(function () {
        var $link = $(this);
        $link.addClass("hint--bottom hint--bounce");
        $link.attr({'aria-label': $link.attr('title')}).removeAttr('title');
    });

    //Disable CTRL+P
    $(document).on('keydown', function (e) {
        if (e.ctrlKey && (e.key == "p" || e.charCode == 16 || e.charCode == 112 || e.keyCode == 80)) {
            e.cancelBubble = true;
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    });

    //Set width to 100%
    $(".type_text.pages-gallery img").css({
        "max-width": "100%"
    });

    $('.switch-container input[type="radio"]').on('click', function () {
        var test = $(this).val();
        setTimeout(function () {
            window.location = test
        }, 500);
    });


    function replaceUrlsWithChapters(div) {
        var urls = div.querySelectorAll('a[href^="https"]');
        urls.forEach(function (url) {
            var chapterUrl = getChapterUrl(url.href);
            url.href = chapterUrl;
        });
    }

    function getChapterUrl(url) {
        if (url.includes('#')) {
            var lastSlashIndex = url.lastIndexOf('/');
            var previousUrl = url.slice(0, lastSlashIndex + 1);
            var chapterName = url.slice(lastSlashIndex + 1);
            chapterName = chapterName.replace(/\s/g, ''); // remove spaces
            chapterName = encodeURIComponent(chapterName);
            return previousUrl + chapterName;
        } else {
            return url;
        }
    }

    var div = document.getElementById('urlEncode');
    if (div) {
        replaceUrlsWithChapters(div);
    }

    document.querySelectorAll('.list-press p').forEach(function (outerItem, index) {
        outerItem.addEventListener('mouseover', function () {
            outerItem.closest('.list-press').querySelector('input').value = outerItem.innerText;
            outerItem.closest('.list-press').querySelectorAll('p').forEach(function (innerItem) {
                innerItem.style.background = 'white';
                innerItem.style.color = 'black';
            });
            outerItem.style.background = 'blue';
            outerItem.style.color = 'white';
        });
    });

    if ($('.finance-section').length > 0 && !sessionStorage.getItem('liveStreamClosed')) {
        $('.live-stream-item').click();
    }

    $('.videogallery').on('onBeforeClose.lg', function (event, prevIndex, index) {
        if ($(event.target).hasClass('live-stream-popup')) {
            sessionStorage.setItem('liveStreamClosed', 'true');
        }
    });


});


