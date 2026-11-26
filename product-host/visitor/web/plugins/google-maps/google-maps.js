function init_map_general(elementId, locations) {
    var mapElement = document.getElementById(elementId);
    if (!mapElement) return;

    var map = new google.maps.Map(mapElement, {
        zoom: 14,
        center: new google.maps.LatLng(40.415556721510114, 49.90301142584571),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var infowindow = new google.maps.InfoWindow({content: '<strong>Bakı şəhəri, Heydər Əliyev prospekti, 167, Mərkəzi Bank</strong>'});
    var marker, i;
    for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i][1], locations[i][2]),
            map: map
        });
        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infowindow.setContent(locations[i][0]);
                infowindow.open(map, marker);
            }
        })(marker, i));
        infowindow.open(map, marker);
    }
}

function init_map() {

    var locations1 = [
        ['<strong>Bakı şəhəri, Heydər Əliyev prospekti, 167, Mərkəzi Bank</strong>', 40.415556721510114, 49.90301142584571, 4],
    ];

    var locations2 = [
        ['<strong>Bakı şəhəri, 8 Noyabr prospekti 23 ünvanında yerləşən 2 saylı “ASAN xidmət” mərkəzi</strong>', 40.379251889566895, 49.87932706688162, 4],
        ['<strong>Bakı şəhəri, Heydər Əliyev prospekti, 115 ünvanında yerləşən 5 saylı “ASAN xidmət”</strong>', 40.41781038782643, 49.90832952826796, 4],
        ['<strong>Sumqayıt şəhəri, Bulvar küçəsi, 66 ünvanında yerləşən 2 saylı “ASAN xidmət”</strong>', 40.59848056544027, 49.681334903239545, 4],
        ['<strong>Naxçıvan şəhəri, Seyid Cəfər Pişəvəri, 7 yerləşən “ASAN xidmət”</strong>', 39.22115594186177, 45.40477117452107, 4],
        ['<strong>Gəncə şəhəri, Nizami Gəncəvi prospekti 784 ünvanında yerləşən 2 saylı Gəncə regional “ASAN xidmət“ mərkəzi</strong>', 40.69679756293273, 46.329099559753594, 4],
        ['<strong>Bakı şəhəri, Heydər Əliyev prospekti, 167, Mərkəzi Bank</strong>', 40.415556721510114, 49.90301142584571, 4],
    ];

    init_map_general('google_map', locations1);
    init_map_general('google_map2', locations2);
}

google.maps.event.addDomListener(window, 'load', init_map);

//Google-maps
$('.type_text a[href^="#map"]').each(function (index) {
    var href = $(this).attr('href');
    var id = 'google_map';
    if (href === '#map2') {
        id = 'google_map2';
    }
    var item = $('<div class="map_canvas"> <div id="' + id + '"></div></div>');
    $(this).replaceWith(item);
});