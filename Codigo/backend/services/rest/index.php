<?php

require_once('phprestsql.php');

$PHPRestSQL =& new PHPRestSQL();

$PHPRestSQL->exec();

/* // Authentication
if ( $PHPRestSQL->authenticate()){
	$PHPRestSQL->exec();
}
else{
	echo "Wrong Authentication";
}
*/



/*
echo '<pre>';
var_dump($PHPRestSQL->output);
//*/

?>