var resizefunc = [];

$(document).on('ready pjax:success', function () {
    //Bootstrap-FileStyle
    $(":file").filestyle({
        buttonText: 'Seç',
        input: false
    });
    //Bootstrap-SelectPicker
    $('.selectpicker').selectpicker({
        style: 'btn-default'
    });
    //Bootstrap-TouchSpin Integer
    $(".touchspin").TouchSpin({
        buttondown_class: "btn btn-inverse",
        buttonup_class: "btn btn-inverse",
        max: 900
    });
    //Bootstrap-TouchSpin Float
    $(".touchspin-float").TouchSpin({
        step: 0.1,
        decimals: 2,
        boostat: 5,
        buttondown_class: "btn btn-inverse",
        buttonup_class: "btn btn-inverse"
    });
    //Bootstrap-ColorPicker
    $('.colorpicker').colorpicker({
        format: 'hex'
    });
    //Bootstrap-DatePicker
    jQuery('.datepicker-autoclose').datepicker({
        format: "yyyy-mm-dd",
        autoclose: true,
        todayHighlight: true
    });
    //Copy-To-Clipboard
    $('.js-copy').click(function () {
        var text = $(this).attr('data-copy');
        var el = $(this);
        copyToClipboard(text, el);
    });

});