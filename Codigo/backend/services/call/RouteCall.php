<?php
$Lat = $_GET['latIn'];
$Long = $_GET['longIn'];
$LatF = $_GET['latFIN'];
$LongF = $_GET['longFIN'];
$url2 = 'http://meetmeat.andreybolanos.com/call/MapsCall.php?'.'latIn='.$Lat.'&longIn='.$Long.'&latFIN='.$LatF.'&longFIN='.$LongF;				
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
?>