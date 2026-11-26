$(document).on('ready pjax:success', function () {
    $(".cb-select").each(function () {
        var label = $(this).data('label');
        var instance = tail.select(this, {
            animate: true,
            classNames: null,
            csvOutput: false,
            csvSeparator: ",",
            descriptions: false,
            deselect: true,
            disabled: false,
            height: 300,
            width: 250,
            hideDisabled: false,
            hideSelected: false,
            locale: "en",
            multiple: false,
            multiLimit: Infinity,
            multiPinSelected: true,
            multiContainer: false,
            multiShowCount: false,
            multiShowLimit: true,
            multiSelectAll: false,
            searchMinLength: 1,
            multiSelectGroup: false,
            openAbove: null,
            placeholder: label,
            search: true,
            searchFocus: false,
            searchMarked: true,
            sortItems: false,
            sortGroups: false,
            sourceBind: false,
            sourceHide: true,
            startOpen: false,
            stayOpen: false,
            cbComplete: undefined,
            cbEmpty: undefined,
            cbLoopItem: undefined,
            cbLoopGroup: undefined
        });
    });
});