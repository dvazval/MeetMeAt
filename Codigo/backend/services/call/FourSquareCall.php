<?php

$Lat = $_GET['lat'];
$Long = $_GET['long'];
if ($_GET['otros']){
	$Otros = '&'.$_GET['otros'];
}else{
	$Otros = ' ';
}



$url2 = 'https://api.foursquare.com/v2/venues/explore?v=20140806&ll='.$Lat.','.$Long.'&client_id=1XICCOLHRTAHUJRQZC1RCYD0BVZEOA1OEAKKZA0QZHTBDBKY&client_secret=HXG1LKOIRZVO1F4S5MZMMWZCHT345CJNF1WBOVVXM4W5DKPY'.$Otros;
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









?>