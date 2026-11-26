(function ($) {
    //Show first active list
    //$('dt:first-of-type').addClass('jquery-list-active').nextUntil('dt').filter(':not(:visible)').slideDown('slow');
    //Handle click function
    $('dt').on('click', function (e) {
        e.preventDefault();
        $(this).parent('dl').children('dd:visible').slideUp('slow');
        $(this).nextUntil('dt').filter(':not(:visible)').slideDown('slow');
        //Only toggle non-displayed
        if (!$(this).hasClass('jquery-list-active')) {
            //remove any active class
            jQuery('dt').removeClass('jquery-list-active');
            //add active class
            $(this).addClass('jquery-list-active');
        } else {
            jQuery('dt').removeClass('jquery-list-active');
        }
        return false;
    });
})(jQuery);