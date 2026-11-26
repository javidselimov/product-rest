$(document).on('ready pjax:success treeview.selected', function () {
    tinyMCE.remove();
    // tinymce.baseURL = 'plugins/tinymce';
    // tinyMCE.suffix = '.min';
    tinymce.init({
        selector: 'textarea',
        convert_urls : false,
        menubar: false,
        branding: false,
        theme: 'modern',
        plugins: [
            'advlist autolink lists link image charmap print preview textcolor',
            'searchreplace code fullscreen',
            'insertdatetime contextmenu paste code definitionlist table'
        ],
        toolbar1: 'insert | undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist ToggleDefinitionList ToggleDefinitionItem | outdent indent| table | removeformat | fullscreen | preview code'
    });
});