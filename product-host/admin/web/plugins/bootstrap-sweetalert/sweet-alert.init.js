/**
 * SweetAlert
 */

!function ($) {
    "use strict";

    var SweetAlert = function () {
    };

    SweetAlert.prototype.init = function () {
        $('#exit-system-alert').click(function (e) {
            swal({
                title: $(e.currentTarget).data("title"),
                text: $(e.currentTarget).data("text"),
                type: "info",
                showCancelButton: true,
                confirmButtonText: $(e.currentTarget).data("confirm-text"),
                cancelButtonText: $(e.currentTarget).data("cancel-text"),
                closeOnConfirm: false,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    window.location.href = '/login/exit';
                }
            });
        });


    },
        //init
        $.SweetAlert = new SweetAlert,
        $.SweetAlert.Constructor = SweetAlert
}(window.jQuery),

//initializing
    function ($) {
        "use strict";
        $.SweetAlert.init()
    }(window.jQuery);