<?php
$Lat = $_GET['latIn'];
$Long = $_GET['longIn'];
$LatF = $_GET['latFIN'];
$LongF = $_GET['longFIN'];

echo '<script src="https://maps.googleapis.com/maps/api/js?v=3.exp"></script>'."\n";
echo '<script> var request = { origin:"Chicago, IL", destination:"Los Angeles, CA", travelMode: google.maps.TravelMode.DRIVING};'."\n"; 
echo 'var directionsService = new google.maps.DirectionsService();'."\n";
echo ' directionsService.route(request, function(response, status) { if (status == google.maps.DirectionsStatus.OK) {'."\n"; 
echo 'var str = JSON.stringify(response);'."\n";
echo 'document.getElementById("p1").innerHTML = str;';
echo '}});'."\n";
echo '</script>';
echo '<p id="p1"></p>'."\n";

/*
$url2 = 'https://api.foursquare.com/v2/venues/explore?v=20140806&ll='.$Lat.','.$Long.'&client_id=1XICCOLHRTAHUJRQZC1RCYD0BVZEOA1OEAKKZA0QZHTBDBKY&client_secret=HXG1LKOIRZVO1F4S5MZMMWZCHT345CJNF1WBOVVXM4W5DKPY'.$Otros;				
echo $url2;
$options2 = array(
    'http' => array(
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'GET',
    ),
);
$context2  = stream_context_create($options2);
$result2 = file_get_contents($url2, false, $context2);
$dump = print_r($result2, true);
echo $dump;
*/
?>