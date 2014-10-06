<?php
$facebookId = $_GET['facebookId'];

$url2 = 'http://meetmeat.andreybolanos.com/rest/facebookId/users/'.$facebookId;				
$options2 = array(
    'http' => array(
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'GET',
    ),
);
$context2  = stream_context_create($options2);
$result2 = file_get_contents($url2, false, $context2);
$dump = print_r($result2, true);

if ($dump != null){
	echo $dump;
}else {
	$token = $facebookId;
	$ptoken = generateRandomString($length = 10);

	$url = 'http://meetmeat.andreybolanos.com/rest/auth/';
	$data = array('id' => $token,
				'privateKey' => $ptoken,
				);
	$options = array(
		'http' => array(
			'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			'method'  => 'POST',
			'content' => str_replace("&", "\r\n", http_build_query($data)),
		),
	);
	$context  = stream_context_create($options);
	$result = file_get_contents($url, false, $context);
	$url2 = 'http://meetmeat.andreybolanos.com/rest/users/';
	$data2 = array('username' => $username,
					'auth_id' => $token,
					);
	$options2 = array(
		'http' => array(
			'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			'method'  => 'POST',
			'content' => str_replace("&", "\r\n", http_build_query($data2)),
		),
	);
	$context2  = stream_context_create($options2);
	$result2 = file_get_contents($url2, false, $context2);
	$dump = print_r($result2, true);

	echo "id=".$dump.",private=".$ptoken.",public=".$token;
}
function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $randomString;
}
?>