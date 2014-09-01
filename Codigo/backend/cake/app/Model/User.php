<?php
class User extends AppModel {
	public $name = 'User';
    public $useTable = 'users';
	
	public $hasAndBelongsToMany = array(
	'Event' => array(
		'className' => 'Event',
		'joinTable' => 'users_events',
		'foreignKey' => 'user_id',
		'associationForeignKey' => 'event_id', 
		'unique' => false
		)
	);
}