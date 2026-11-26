$(document).on('ready pjax:success treeview.selected', function () {
    $("[data-fancybox]").fancybox({
        iframe: {
            css: {
                width: $(".fancybox").data("width"),
                height: $(".fancybox").data("height")
            },
            scrolling: 'auto'
        },
        hash: false,
        slideShow: false,
        fullScreen: false,
        infobar: true,
        buttons: false,
        onComplete: function (instance, current) {
            if (instance.group.length > 1 && current.$content) {
                current.$content.append('<a data-fancybox-next class="button-next" href="javascript:;"><i class="fa fa-angle-right"></i></a><a data-fancybox-previous class="button-previous" href="javascript:;"><i class="fa fa-angle-left"></i></a>');
            }
            current.$content.append('<a data-fancybox-close class="button-close" href="javascript:;"><i class="fa fa-times"></i></a>');
        }
    });
    $.fancybox.defaults.hash = false;
});