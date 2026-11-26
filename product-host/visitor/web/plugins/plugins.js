$(document).ready(function () {
    $('.formstyler').styler();
});


function setEqualHeight(columns) {
    var tallestcolumn = 0;
    columns.each(
        function () {
            currentHeight = $(this).height();
            if (currentHeight > tallestcolumn) {
                tallestcolumn = currentHeight;
            }
        }
    );
    columns.height(tallestcolumn);
}

$(window).resize(function () {
    $('.card_item').css('height', 'auto'); //solve for all you browser stretchers out there!
    setEqualHeight($('.card_item'));
});
$(window).load(function () {
    setEqualHeight($(".card_item"));
});


$(document).ready(function () {
    $("#leftMenu").navgoco({accordion: true});
});
$(document).ready(function () {
    $("#infolines").navgoco({accordion: true});
});
$(document).ready(function () {
    $("#pagesMenu").navgoco({accordion: true});
});

(function ($) {
    $(function () {
        $('ul.tabs_caption').on('click', 'li:not(.active)', function () {
            $(this)
                .addClass('active').siblings().removeClass('active')
                .closest('div.wrap_tabs').find('div.tabs_content').removeClass('active').eq($(this).index()).addClass('active');
        });
    });
})(jQuery);

var swiper = new Swiper('.swiper-container-banners', {
    nextButton: '.swiper-button-next1',
    prevButton: '.swiper-button-prev1',
    autoplay: 2500,
    spaceBetween: 20,
    slidesPerView: 5,
    loop: true,
    breakpoints: {
        1170: {
            slidesPerView: 4
        },
        980: {
            slidesPerView: 3
        },
        667: {
            slidesPerView: 2
        },
        480: {
            slidesPerView: 1
        }
    }
});

jQuery(document).ready(function ($) {
    $("#menu").mmenu({
        "extensions": [
            "pagedim-black"
        ],
        "navbars": [
            {
                "position": "top",
                "content": [
                    '<div class="mobile-search-wrapper" style="padding: 0px 15px; width: 100%; box-sizing: border-box; position: relative; z-index: 100;">' +
                    '<form action="' + (window.YiiSearchUrl || '/search/index') + '" method="get" class="mobile-search-form">' +
                    '<div style="position: relative; display: flex; align-items: center; background: #f2f2f2; border-radius: 4px; border: 1px solid #ccc; padding: 5px 10px;">' +
                    '<input type="text" name="query" placeholder="' + (window.YiiSearchPlaceholder || 'Search') + '" style="border: none; width: 100%; outline: none; font-size: 16px; padding: 4px; color: #333; background: transparent;">' +
                    '<input type="hidden" name="type" value="pages">' +
                    '<button type="submit" style="background: none; border: none; cursor: pointer; padding: 0 5px; display: flex; align-items: center;">' +
                    '<img src="/images/search.svg" alt="Search" style="width: 20px; height: 20px;">' +
                    '</button>' +
                    '</div>' +
                    '</form>' +
                    '</div>'
                ]
            }
        ]
    });

    // Prevent empty search in mobile menu
    $(document).on('submit', '.mobile-search-form', function (e) {
        var query = $(this).find('input[name="query"]').val();
        if (!query || query.trim() === "") {
            e.preventDefault();
            return false;
        }
    });
});

pickmeup.defaults.locales['az'] = {
    days: ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'],
    daysShort: ['B', 'Be', 'Ça', 'Ç', 'Ca', 'C', 'Ş'],
    daysMin: ['B', 'Be', 'Ça', 'Ç', 'Ca', 'C', 'Ş'],
    months: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
    monthsShort: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyun', 'İyul', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek']
};

pickmeup.defaults.locales['en'] = {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

var min_date_for_currencies = '25/11/1993';


$(document).on('ready pjax:success', function () {

    pickmeup('.date-from', {
        hide_on_select: true,
        min: min_date_for_currencies
    });

    pickmeup('.date-to', {
        hide_on_select: true,
        min: min_date_for_currencies
    });

    pickmeup('.date-without-day', {
        hide_on_select: true,
        select_day: false,
        min: '01/2007'
    });

    pickmeup('.date-meas-from', {
        hide_on_select: true,
        default_date: false,
    });

    pickmeup('.date-meas-to', {
        hide_on_select: true,
        default_date: false,
    });
});

$(".date-current").each(function () {
    var elem = this;
    pickmeup(elem, {
        hide_on_select: true,
        min: min_date_for_currencies
    });
    elem.addEventListener('pickmeup-change', function (e) {
        window.location.replace("?date=" + e.detail.formatted_date);
    })
});

$('.auto-redirect').change(function () {
    var url = $(this).children('option:selected').data('href');
    window.location.replace(url);
});

$(".date-infolines").each(function () {
    var elem = this;
    pickmeup(elem, {
        hide_on_select: true,
        select_day: false,
        select_month: false,
        min: '2007'
    });
    elem.addEventListener('pickmeup-change', function (e) {
        window.location.replace("?year=" + e.detail.formatted_date);
    })
});

$('.date-from,.date-to,.date-without-day,.date-current,.date-infolines').on('click', function (e) {
    e.preventDefault();
    $(this).attr("autocomplete", "off");
});


$('.table-pagination').paginate({
    perPage: 14,
    autoScroll: false,
    paginatePosition: ['bottom'],
    containerTag: 'div',
    useHashLocation: true
});

$('.press-releases-pagination').paginate({
    perPage: 5,
    autoScroll: false,
    paginatePosition: ['bottom'],
    containerTag: 'div',
    useHashLocation: true
});

$('.gallery-pagination').paginate({
    perPage: 6,
    autoScroll: false,
    paginatePosition: ['bottom'],
    containerTag: 'div',
    useHashLocation: true
});

$(window).bind("load", function () {
    $('.assets-pagination').paginate({
        perPage: 6,
        autoScroll: false,
        paginatePosition: ['bottom'],
        containerTag: 'div',
        useHashLocation: true
    });
});

$('#print-page').on("click", function () {
    $('.type_text, .table_content').printThis({
        loadCSS: "css/print.css",
        header: "<h3>" + document.title + " | www.cbar.az</h3>",
    });
});