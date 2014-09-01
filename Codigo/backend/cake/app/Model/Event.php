<?php
class Event extends AppModel {
    public $name = 'Event';
    public $useTable = 'events';
	
	public $hasAndBelongsToMany = array(
	'User' => array(
		'className' => 'User',
		'joinTable' => 'users_events',
		'foreignKey' => 'event_id',
		'associationForeignKey' => 'user_id', 
		'unique' => false
		),
		
	'Activity' => array(
		'className' => 'Activity',
		'joinTable' => 'events_activities',
		'foreignKey' => 'event_id',
		'associationForeignKey' => 'activity_id', 
		'unique' => false
		)
	);
}